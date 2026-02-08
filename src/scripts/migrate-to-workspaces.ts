/**
 * Migration Script: Clients → Workspaces
 * 
 * This script migrates existing Client records to Workspace records.
 * It maintains backward compatibility by:
 * 1. Creating a workspace for each client
 * 2. Linking the client to the workspace via workspaceId
 * 3. Moving FAQs from client to workspace
 * 
 * Run this once after deploying the workspace model.
 * 
 * Usage: tsx src/scripts/migrate-to-workspaces.ts
 * cd whatsapp-faq-bot
 * npm run migrate:workspaces
 */

import * as dotenv from 'dotenv';
import { connectToMongoDB } from '../db/mongodb.js';
import { ClientService } from '../services/client-service.js';
import { WorkspaceService } from '../services/workspace-service.js';
import { Workspace } from '../models/workspace.js';
import chalk from 'chalk';

dotenv.config();

async function migrateClientsToWorkspaces(): Promise<void> {
  console.log(chalk.blue('🔄 Starting migration: Clients → Workspaces...\n'));

  try {
    // Connect to MongoDB
    await connectToMongoDB();
    console.log(chalk.green('✅ Connected to MongoDB\n'));

    const clientService = new ClientService();
    const workspaceService = new WorkspaceService();

    // Get all clients
    const clients = await clientService.getActiveClients();
    const expiredClients = await clientService.getExpiredClients();
    const allClients = [...clients, ...expiredClients];

    console.log(chalk.cyan(`📊 Found ${allClients.length} clients to migrate\n`));

    if (allClients.length === 0) {
      console.log(chalk.yellow('⚠️  No clients found. Migration complete (nothing to do).'));
      return;
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const client of allClients) {
      try {
        // Check if workspace already exists for this client
        const existingWorkspace = await workspaceService.getWorkspaceByClientId(client.clientId);
        
        if (existingWorkspace) {
          console.log(chalk.yellow(`⏭️  Skipping ${client.businessName} (workspace already exists)`));
          skipped++;
          continue;
        }

        // Check if workspace exists for this phone number
        const existingByPhone = await workspaceService.getWorkspaceByPhoneNumber(client.whatsappNumber);
        if (existingByPhone) {
          console.log(chalk.yellow(`⏭️  Skipping ${client.businessName} (workspace exists for phone ${client.whatsappNumber})`));
          skipped++;
          continue;
        }

        // Generate workspaceId (use clientId as base)
        const workspaceId = `workspace_${client.clientId}`;

        // Create workspace from client data
        const workspace: Omit<Workspace, '_id' | 'createdAt' | 'updatedAt'> = {
          workspaceId,
          businessName: client.businessName,
          phoneNumbers: [client.whatsappNumber],
          email: client.email,
          botConfig: {
            type: 'faq', // Default to FAQ bot
          },
          subscription: {
            status: client.subscription.status,
            tier: client.subscription.tier,
            trialStartDate: client.subscription.trialStartDate,
            trialEndDate: client.subscription.trialEndDate,
            subscriptionStartDate: client.subscription.subscriptionStartDate,
            subscriptionEndDate: client.subscription.subscriptionEndDate,
            lastPaymentDate: client.subscription.lastPaymentDate,
            paymentMethod: client.subscription.paymentMethod,
          },
          settings: {
            businessHours: {
              start: client.config.businessHours.start,
              end: client.config.businessHours.end,
            },
            timezone: client.config.timezone,
            afterHoursMessage: client.config.afterHoursMessage,
            adminNumbers: client.config.adminNumbers || [],
          },
          faqs: client.faqs, // Move FAQs to workspace
          clientId: client.clientId, // Link back to original client
        };

        // Create workspace
        const createdWorkspace = await workspaceService.createWorkspace(workspace);
        console.log(chalk.green(`✅ Created workspace for ${client.businessName} (${workspaceId})`));

        // Update client to link to workspace
        await clientService.updateClient(client.clientId, {
          workspaceId: workspaceId,
        });
        console.log(chalk.green(`   → Linked client ${client.clientId} to workspace\n`));

        migrated++;

      } catch (error) {
        console.error(chalk.red(`❌ Error migrating ${client.businessName}:`), error);
        errors++;
      }
    }

    console.log(chalk.blue('\n📊 Migration Summary:'));
    console.log(chalk.green(`   ✅ Migrated: ${migrated}`));
    console.log(chalk.yellow(`   ⏭️  Skipped: ${skipped}`));
    console.log(chalk.red(`   ❌ Errors: ${errors}`));
    console.log(chalk.cyan(`   📦 Total: ${allClients.length}\n`));

    if (errors === 0) {
      console.log(chalk.green('✅ Migration completed successfully!\n'));
    } else {
      console.log(chalk.yellow('⚠️  Migration completed with errors. Please review the logs above.\n'));
    }

  } catch (error) {
    console.error(chalk.red('❌ Migration failed:'), error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateClientsToWorkspaces();
