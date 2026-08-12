const fs = require('fs');
const path = require('path');

const envVar = process.env.PUNTODECRUZ_EXCLUDE_EXPO_DEV_CLIENT;
const profile = process.env.EAS_BUILD_PROFILE || '';

// Determine if we should exclude expo-dev-client
let shouldExclude = false;

if (envVar === 'true') {
  shouldExclude = true;
} else if (envVar === 'false') {
  shouldExclude = false;
} else {
  // If envVar is not set, exclude for any profile other than 'development'
  if (profile !== 'development') {
    shouldExclude = true;
  }
}

if (!shouldExclude) {
  console.log(`[prepare-eas-dependencies] Keeping expo-dev-client for profile '${profile}' (PUNTODECRUZ_EXCLUDE_EXPO_DEV_CLIENT=${envVar})`);
  process.exit(0);
}

console.log(`[prepare-eas-dependencies] Excluding expo-dev-client for profile '${profile}' (PUNTODECRUZ_EXCLUDE_EXPO_DEV_CLIENT=${envVar})`);

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');

// 1. Modify package.json
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  ['dependencies', 'devDependencies', 'optionalDependencies'].forEach((depType) => {
    if (pkg[depType] && pkg[depType]['expo-dev-client']) {
      delete pkg[depType]['expo-dev-client'];
      console.log(`[prepare-eas-dependencies] Removed expo-dev-client from ${depType} in package.json`);
    }
  });
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
}

// 2. Modify package-lock.json
if (fs.existsSync(packageLockPath)) {
  const lock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));

  // Remove from root package dependencies if lockfileVersion >= 2
  if (lock.packages && lock.packages['']) {
    ['dependencies', 'devDependencies', 'optionalDependencies'].forEach((depType) => {
      if (lock.packages[''][depType] && lock.packages[''][depType]['expo-dev-client']) {
        delete lock.packages[''][depType]['expo-dev-client'];
      }
    });
  }

  const packagesToRemove = [
    'node_modules/expo-dev-client',
    'node_modules/expo-dev-launcher',
    'node_modules/expo-dev-menu',
    'node_modules/expo-dev-menu-interface',
    'node_modules/expo-json-utils',
    'node_modules/expo-manifests',
    'node_modules/expo-updates-interface'
  ];

  if (lock.packages) {
    for (const pkgKey of Object.keys(lock.packages)) {
      if (packagesToRemove.some(p => pkgKey === p || pkgKey.startsWith(p + '/'))) {
        delete lock.packages[pkgKey];
        console.log(`[prepare-eas-dependencies] Removed ${pkgKey} from packages in package-lock.json`);
      }
    }
  }

  // Legacy lockfile dependencies object (lockfileVersion 1 / 2)
  if (lock.dependencies) {
    const depsToRemove = [
      'expo-dev-client',
      'expo-dev-launcher',
      'expo-dev-menu',
      'expo-dev-menu-interface',
      'expo-json-utils',
      'expo-manifests',
      'expo-updates-interface'
    ];
    depsToRemove.forEach(dep => {
      if (lock.dependencies[dep]) {
        delete lock.dependencies[dep];
        console.log(`[prepare-eas-dependencies] Removed ${dep} from dependencies in package-lock.json`);
      }
    });
  }

  fs.writeFileSync(packageLockPath, JSON.stringify(lock, null, 2) + '\n');
}

console.log('[prepare-eas-dependencies] Completed dependency preparation.');
