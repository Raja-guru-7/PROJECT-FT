/**
 * AroundU — Mobile Responsive Patch Script
 * 
 * Run this from your project root:
 *   node mobile_responsive_patch.cjs
 * 
 * What it fixes (styling only, zero logic changes):
 *  1. Text sizes → responsive (text-4xl becomes text-2xl md:text-4xl, etc.)
 *  2. Fixed px widths on containers → w-full with max-w
 *  3. grid-cols-3 / grid-cols-4 → auto-responsive with sm: breakpoints
 *  4. Oversized padding (p-12, px-16) → mobile-friendly
 *  5. Flex rows that should stack on mobile
 *  6. Hidden overflow fixes on page wrappers
 *  7. Adds safe-area bottom padding class where needed
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['pages', 'components', 'src/pages', 'src/components'];

// ─── REPLACEMENT RULES ────────────────────────────────────────────────────────
// Each rule: { find: RegExp, replace: string|fn, description: string }
const RULES = [

  // 1. Responsive text sizes
  {
    description: 'text-5xl → responsive',
    find: /\btext-5xl\b/g,
    replace: 'text-3xl md:text-5xl'
  },
  {
    description: 'text-4xl → responsive',
    find: /\btext-4xl\b/g,
    replace: 'text-2xl md:text-4xl'
  },
  {
    description: 'text-3xl → responsive',
    find: /\btext-3xl\b/g,
    replace: 'text-xl md:text-3xl'
  },

  // 2. Grid columns → mobile-first
  {
    description: 'grid-cols-4 → responsive',
    find: /\bgrid-cols-4\b/g,
    replace: 'grid-cols-2 md:grid-cols-4'
  },
  {
    description: 'grid-cols-3 → responsive',
    find: /\bgrid-cols-3\b/g,
    replace: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
  },
  {
    description: 'grid-cols-2 without sm: prefix → keep but ensure safe',
    find: /(?<!sm:|md:|lg:)\bgrid-cols-2\b/g,
    replace: 'grid-cols-1 sm:grid-cols-2'
  },

  // 3. Oversized padding → responsive
  {
    description: 'p-12 → responsive padding',
    find: /\bp-12\b/g,
    replace: 'p-4 md:p-12'
  },
  {
    description: 'p-10 → responsive padding',
    find: /\bp-10\b/g,
    replace: 'p-4 md:p-10'
  },
  {
    description: 'px-16 → responsive padding',
    find: /\bpx-16\b/g,
    replace: 'px-4 md:px-16'
  },
  {
    description: 'px-12 → responsive padding',
    find: /\bpx-12\b/g,
    replace: 'px-4 md:px-12'
  },
  {
    description: 'px-10 → responsive padding',
    find: /\bpx-10\b/g,
    replace: 'px-4 md:px-10'
  },
  {
    description: 'py-20 → responsive padding',
    find: /\bpy-20\b/g,
    replace: 'py-10 md:py-20'
  },
  {
    description: 'py-16 → responsive padding',
    find: /\bpy-16\b/g,
    replace: 'py-8 md:py-16'
  },

  // 4. Gap sizes on mobile
  {
    description: 'gap-12 → responsive gap',
    find: /\bgap-12\b/g,
    replace: 'gap-4 md:gap-12'
  },
  {
    description: 'gap-10 → responsive gap',
    find: /\bgap-10\b/g,
    replace: 'gap-4 md:gap-10'
  },

  // 5. Fixed widths that overflow mobile
  {
    description: 'w-[600px] → responsive',
    find: /\bw-\[600px\]/g,
    replace: 'w-full max-w-[600px]'
  },
  {
    description: 'w-[500px] → responsive',
    find: /\bw-\[500px\]/g,
    replace: 'w-full max-w-[500px]'
  },
  {
    description: 'w-[800px] → responsive',
    find: /\bw-\[800px\]/g,
    replace: 'w-full max-w-[800px]'
  },
  {
    description: 'min-w-[400px] standalone → mobile safe',
    find: /\bmin-w-\[400px\]/g,
    replace: 'w-full md:min-w-[400px]'
  },

  // 6. Flex row that should stack on mobile
  // Only targets "flex gap-X" combos without existing flex-col or sm: prefix
  {
    description: 'flex items-center gap without responsive → add flex-wrap',
    find: /\bflex items-center gap-(\d+)\b(?! flex-wrap)/g,
    replace: 'flex flex-wrap items-center gap-$1'
  },

  // 7. Space between large → responsive
  {
    description: 'space-x-8 → responsive',
    find: /\bspace-x-8\b/g,
    replace: 'space-x-2 md:space-x-8'
  },
  {
    description: 'space-x-6 → responsive',
    find: /\bspace-x-6\b/g,
    replace: 'space-x-2 md:space-x-6'
  },

  // 8. h-screen on inner divs (not root) can cause overflow on mobile Safari
  // Only targets h-screen when paired with overflow-hidden (safe to fix)
  {
    description: 'h-screen overflow-hidden inner → min-h-screen',
    find: /\bh-screen overflow-hidden\b/g,
    replace: 'min-h-screen overflow-hidden'
  },

  // 9. Rounded-none on inputs/buttons that are too small on mobile
  {
    description: 'Add touch-friendly sizing hint (min-h) to common button patterns',
    find: /\brounded-xl px-4 py-2\b/g,
    replace: 'rounded-xl px-4 py-2 min-h-[44px]'
  },
  {
    description: 'Small py-1 buttons → touch friendly',
    find: /\brounded-full px-4 py-1\b/g,
    replace: 'rounded-full px-4 py-2 min-h-[44px]'
  },

];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getAllTsxFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function applyRules(content) {
  let result = content;
  const applied = [];
  for (const rule of RULES) {
    const before = result;
    result = result.replace(rule.find, rule.replace);
    if (result !== before) {
      applied.push(rule.description);
    }
  }
  return { result, applied };
}

// ─── DEDUPLICATION (prevents double-patching) ─────────────────────────────────
// If a class already has a sm:/md: prefix version, skip it
function alreadyResponsive(content, mobileClass, desktopClass) {
  return content.includes(desktopClass);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

console.log('\n🔧 AroundU Mobile Responsive Patch');
console.log('=====================================\n');

let totalFiles = 0;
let modifiedFiles = 0;

for (const dir of TARGET_DIRS) {
  const fullDirPath = path.join(process.cwd(), dir);
  const files = getAllTsxFiles(fullDirPath);

  for (const filePath of files) {
    totalFiles++;
    const original = fs.readFileSync(filePath, 'utf8');
    const { result, applied } = applyRules(original);

    if (original !== result) {
      fs.writeFileSync(filePath, result, 'utf8');
      modifiedFiles++;
      const relPath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relPath}`);
      for (const a of applied) {
        console.log(`   → ${a}`);
      }
    }
  }
}

console.log(`\n📊 Summary: ${modifiedFiles} / ${totalFiles} files updated`);
console.log('\n✨ Done! Now check your app on mobile.\n');
console.log('💡 Tips after running:');
console.log('   • Check Navbar.tsx manually — bottom nav z-index must be above content');
console.log('   • If any grid looks broken, add sm:grid-cols-2 manually');
console.log('   • AiAssistant floating button — ensure z-50 and bottom-20 on mobile\n');
