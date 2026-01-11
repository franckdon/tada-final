const fs = require('fs');
const path = require('path');

// Lire le fichier schema.prisma
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

console.log('🔧 Correction du schéma Prisma pour SQLite...');

// Remplacer les types incompatibles
const replacements = [
  { from: /@db\.Uuid/g, to: '' },
  { from: /@db\.Text/g, to: '' },
  { from: /@db\.VarChar\([^)]*\)/g, to: '' },
  { from: /@db\.Decimal\([^)]*\)/g, to: '' },
  { from: /Decimal\s*@db\.Decimal\([^)]*\)/g, to: 'Float' },
  { from: /Decimal/g, to: 'Float' }
];

replacements.forEach(replacement => {
  const before = schema;
  schema = schema.replace(replacement.from, replacement.to);
  if (before !== schema) {
    console.log(`✅ Remplacé: ${replacement.from} -> ${replacement.to}`);
  }
});

// Écrire le fichier corrigé
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('✅ Schéma Prisma corrigé avec succès !');
console.log('🚀 Vous pouvez maintenant exécuter: bun prisma generate');
