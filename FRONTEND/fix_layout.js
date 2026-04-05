const fs = require('fs');
const path = require('path');

const dirs = ['pages', 'components'];

for (const dir of dirs) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) continue;
  
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.tsx'));
  
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let replaced = false;
    let newContent = content.replace(/(className="[^"]*)(max-w-[a-z0-9\-]+)([^"]*")/gi, (match, prefix, maxW, suffix) => {
        if (!replaced && match.includes('mx-auto')) {
            replaced = true;
            let cleanPrefix = prefix.replace(/\bmx-auto\b\s*/g, '');
            let cleanSuffix = suffix.replace(/\bmx-auto\b\s*/g, '')
                                    .replace(/\bpx-[a-z0-9\-]+\b\s*/g, '')
                                    .replace(/\bsm:px-[a-z0-9\-]+\b\s*/g, '')
                                    .replace(/\bmd:px-[a-z0-9\-]+\b\s*/g, '')
                                    .replace(/\blg:px-[a-z0-9\-]+\b\s*/g, '');
            return (cleanPrefix + "w-full px-4 md:px-8 " + cleanSuffix).replace(/\s+/g, ' ').replace(' "', '"');
        }
        return match;
    });

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated wrapper in', file);
    }
  }
}
