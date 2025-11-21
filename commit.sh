#!/bin/bash
cd /Users/cschweda/webdev/icjia-accessibility-status
git add -A
git commit -m "docs: audit and reorganize documentation

- Remove 60 outdated root-level markdown files
- Delete 2 outdated /docs files  
- Update migration file names across documentation
- Update deployment commands
- Update 8 documentation files with current project state
- Verify all internal links are working correctly"
git push origin main

