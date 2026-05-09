import os

file_path = 'src/Learn.js'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# lines is 0-indexed, so line 20 is index 19.
# We want to keep lines 1-19 (indices 0-18) and lines 150-end (indices 149-...)
new_lines = lines[0:19] + lines[149:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
