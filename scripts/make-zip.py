import os
import zipfile

output_zip = os.path.join('public', 'portal-noticias.zip')
exclude_dirs = {'node_modules', '.astro', 'dist', '.git', '.cache', '.system_generated', '.aistudio'}
exclude_files = {'portal-noticias.zip', '.DS_Store'}

os.makedirs('public', exist_ok=True)

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        for file in files:
            if file in exclude_files or file.endswith('.pyc'):
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)

size_kb = round(os.path.getsize(output_zip) / 1024, 1)
print(f"ZIP gerado com sucesso em {output_zip} ({size_kb} KB)")
