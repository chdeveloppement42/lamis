import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: 'postgresql://postgres:chdev2026@localhost:5432/immo_lamis?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // 1. Create Default Permissions
  const permissionsData = [
    { action: 'view:dashboard', description: 'Accès au tableau de bord' },
    { action: 'manage:providers', description: 'Valider / Rejeter / Suspendre des fournisseurs' },
    { action: 'manage:listings', description: 'Publier / Dépublier / Supprimer des annonces' },
    { action: 'manage:categories', description: 'Ajouter / Modifier / Supprimer des catégories' },
    { action: 'manage:users', description: 'Consulter les utilisateurs / Réinitialiser les mots de passe' },
    { action: 'manage:admins', description: 'Créer / Modifier / Désactiver des comptes administrateurs' },
    { action: 'view:notifications', description: 'Consulter les notifications de la plateforme' },
    { action: 'manage:permissions', description: 'Gérer les rôles et permissions (Super Admin uniquement)' },
    { action: 'read:roles', description: 'Consulter la liste des rôles disponibles' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    });
  }

  // Fetch created permissions to assign to roles
  const allPermissions = await prisma.permission.findMany();

  // 2. Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      isDefault: true,
      isSuperAdmin: true,
      permissions: {
        create: allPermissions.map((p: any) => ({
          permission: { connect: { id: p.id } },
        })),
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      isDefault: true,
      isSuperAdmin: false,
      permissions: {
        create: allPermissions
          .filter((p: any) => p.action !== 'manage:permissions')
          .map((p: any) => ({
            permission: { connect: { id: p.id } },
          })),
      },
    },
  });

  await prisma.role.upsert({
    where: { name: 'Modérateur' },
    update: {},
    create: {
      name: 'Modérateur',
      isDefault: true,
      isSuperAdmin: false,
      permissions: {
        create: allPermissions
          .filter((p: any) => ['view:dashboard', 'manage:listings', 'view:notifications'].includes(p.action))
          .map((p: any) => ({
            permission: { connect: { id: p.id } },
          })),
      },
    },
  });

  // 3. Create Super Admin User
  const password = await bcrypt.hash('0000', 10);
  
  await prisma.admin.upsert({
    where: { email: 'admin@immolamis.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@immolamis.com',
      password,
      isSuperAdmin: true,
      status: 'VALIDATED',
      roleId: superAdminRole.id,
    },
  });

  // 4. Create categories
  const categoriesData = [
    { name: 'Appartement', slug: 'appartement' },
    { name: 'Villa', slug: 'villa' },
    { name: 'Bureau', slug: 'bureau' },
    { name: 'Terrain', slug: 'terrain' },
    { name: 'Local Commercial', slug: 'local-commercial' },
    { name: 'Entrepôt', slug: 'entrepot' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name }, // Fix typos on re-seed
      create: cat,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
