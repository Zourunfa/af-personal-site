"""Install a built /me/ archive on the existing server without replacing its app."""
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import time

archive = pathlib.Path(sys.argv[1])
stamp = time.strftime('%Y%m%d-%H%M%S')
base = pathlib.Path('/var/www/zourunfa-portfolio')
release = base / 'releases' / stamp
target = release / 'me'
target.mkdir(parents=True, exist_ok=False)
with tarfile.open(archive) as bundle:
    for member in bundle.getmembers():
        if member.name.startswith('/') or '..' in pathlib.PurePosixPath(member.name).parts or member.issym() or member.islnk():
            raise ValueError('Unsafe archive member')
    bundle.extractall(target)
if not (target / 'index.html').is_file():
    raise ValueError('Missing index.html')
# Already-open pages may still import chunks from ANY earlier release.
# Copy only absent hashed assets; never replace the new release's own files.
assets = target / 'assets'
assets.mkdir(exist_ok=True)
for old_release in (base / 'releases').iterdir():
    if old_release == release or not old_release.is_dir():
        continue
    old_assets = old_release / 'me' / 'assets'
    if old_assets.is_dir():
        for old_asset in old_assets.iterdir():
            if old_asset.is_file() and not old_asset.is_symlink() and not (assets / old_asset.name).exists():
                shutil.copy2(old_asset, assets / old_asset.name)
current = base / 'current'
previous = current.readlink() if current.is_symlink() else None
if current.exists() and not current.is_symlink():
    raise ValueError('Refusing to replace a non-symlink current directory')
config = pathlib.Path('/etc/nginx/sites-available/www.afai.asia')
original = config.read_text()
marker = '    # ZOURUNFA_PORTFOLIO_BEGIN'
snippet = '''    # ZOURUNFA_PORTFOLIO_BEGIN
    location = /me { return 301 /me/; }
    location ^~ /me/ {
        root /var/www/zourunfa-portfolio/current;
        index index.html;
        try_files $uri $uri/ /me/index.html;
        add_header Cache-Control "no-cache";
        add_header X-Content-Type-Options nosniff always;
        location ^~ /me/assets/ {
            try_files $uri =404;
        }
    }
    # ZOURUNFA_PORTFOLIO_END

'''
if marker not in original:
    needle = '    location / {\n        proxy_pass http://127.0.0.1:3000;'
    if original.count(needle) != 1:
        raise ValueError('Expected unique existing application location')
    backup = base / ('nginx-before-' + stamp + '.conf')
    backup.write_text(original)
    updated = original.replace(needle, snippet + needle, 1)
else:
    updated, replacements = re.subn(
        r'    # ZOURUNFA_PORTFOLIO_BEGIN\n.*?    # ZOURUNFA_PORTFOLIO_END\n\n',
        lambda _: snippet, original, flags=re.DOTALL,
    )
    if replacements != 1:
        raise ValueError('Expected exactly one portfolio location block')
try:
    temporary = base / ('current-' + stamp)
    temporary.symlink_to(release)
    temporary.replace(current)
    config.write_text(updated)
    subprocess.run(['nginx', '-t'], check=True)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
except Exception:
    config.write_text(original)
    if previous is not None:
        rollback = base / ('rollback-' + stamp)
        rollback.symlink_to(previous)
        rollback.replace(current)
    elif current.is_symlink():
        current.unlink()
    raise
print('DEPLOYED', release)
