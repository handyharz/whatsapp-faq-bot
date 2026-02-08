#!/usr/bin/env node
/**
 * Seed FAQs from JSON file for a specific client/workspace
 * 
 * Defaults to: harzkane@gmail.com (workspace_8a0e440baf213ec7)
 * 
 * Usage:
 *   npx tsx src/scripts/seed-faqs.ts [email|workspaceId|clientId]
 *   # OR
 *   bun src/scripts/seed-faqs.ts [email|workspaceId|clientId]
 * 
 * Examples:
 *   npx tsx src/scripts/seed-faqs.ts                    # Uses default: harzkane@gmail.com
 *   npx tsx src/scripts/seed-faqs.ts harzkane@gmail.com
 *   bun src/scripts/seed-faqs.ts                        # Uses default: harzkane@gmail.com
 */

import { connectToMongoDB, disconnectFromMongoDB, getClientsCollection } from '../db/mongodb.js';
import { ClientService } from '../services/client-service.js';
import { WorkspaceService } from '../services/workspace-service.js';
import { FAQ } from '../models/client.js';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedFAQs() {
  // Default to your client if no identifier provided
  const identifier = process.argv[2] || 'harzkane@gmail.com';

  if (!identifier) {
    console.error(chalk.red('❌ Error: Client/Workspace identifier is required'));
    console.log(chalk.yellow('\nUsage: tsx src/scripts/seed-faqs.ts [email|workspaceId|clientId]'));
    console.log(chalk.gray('\nExamples:'));
    console.log(chalk.gray('  tsx src/scripts/seed-faqs.ts'));
    console.log(chalk.gray('  tsx src/scripts/seed-faqs.ts harzkane@gmail.com'));
    console.log(chalk.gray('  tsx src/scripts/seed-faqs.ts workspace_8a0e440baf213ec7'));
    console.log(chalk.gray('  tsx src/scripts/seed-faqs.ts client_d79f7cd5fbbe7507\n'));
    process.exit(1);
  }

  try {
    console.log(chalk.blue('📚 Seeding FAQs from JSON file...\n'));

    // Read FAQs from JSON file
    const faqsPath = path.join(__dirname, '../../data/faqs.restaurant.json');
    if (!fs.existsSync(faqsPath)) {
      console.error(chalk.red(`❌ FAQ file not found: ${faqsPath}`));
      process.exit(1);
    }

    const faqsData = fs.readFileSync(faqsPath, 'utf-8');
    const faqs: FAQ[] = JSON.parse(faqsData);

    console.log(chalk.cyan(`📖 Loaded ${faqs.length} FAQs from ${path.basename(faqsPath)}\n`));

    await connectToMongoDB();

    const clientService = new ClientService();
    const workspaceService = new WorkspaceService();

    // Find client/workspace by identifier
    let client = null;
    let workspace = null;

    // Try to find by email
    if (identifier.includes('@')) {
      console.log(chalk.blue(`🔍 Searching for client by email: ${identifier}`));
      const clientsCollection = getClientsCollection();
      client = await clientsCollection.findOne({ email: identifier.toLowerCase() });
      
      if (client && client.workspaceId) {
        workspace = await workspaceService.getWorkspaceById(client.workspaceId);
      }
    }
    // Try to find by workspaceId
    else if (identifier.startsWith('workspace_')) {
      console.log(chalk.blue(`🔍 Searching for workspace: ${identifier}`));
      workspace = await workspaceService.getWorkspaceById(identifier);
      
      if (workspace && workspace.clientId) {
        client = await clientService.getClientById(workspace.clientId);
      } else if (workspace) {
        // Try to find client by workspaceId
        const clientsCollection = getClientsCollection();
        client = await clientsCollection.findOne({ workspaceId: identifier });
      }
    }
    // Try to find by clientId
    else if (identifier.startsWith('client_')) {
      console.log(chalk.blue(`🔍 Searching for client: ${identifier}`));
      client = await clientService.getClientById(identifier);
      
      if (client && client.workspaceId) {
        workspace = await workspaceService.getWorkspaceById(client.workspaceId);
      }
    }
    // Try as email (case-insensitive)
    else {
      console.log(chalk.blue(`🔍 Searching for client by email: ${identifier}`));
      const clientsCollection = getClientsCollection();
      client = await clientsCollection.findOne({ email: identifier.toLowerCase() });
      
      if (client && client.workspaceId) {
        workspace = await workspaceService.getWorkspaceById(client.workspaceId);
      }
    }

    if (!client && !workspace) {
      console.error(chalk.red(`❌ No client or workspace found with identifier: ${identifier}`));
      console.log(chalk.yellow('\n💡 Try using:'));
      console.log(chalk.gray('  - Email address (e.g., harzkane@gmail.com)'));
      console.log(chalk.gray('  - Workspace ID (e.g., workspace_8a0e440baf213ec7)'));
      console.log(chalk.gray('  - Client ID (e.g., client_d79f7cd5fbbe7507)\n'));
      await disconnectFromMongoDB();
      process.exit(1);
    }

    if (client) {
      console.log(chalk.green(`✅ Found client: ${client.businessName} (${client.clientId})`));
    }
    if (workspace) {
      console.log(chalk.green(`✅ Found workspace: ${workspace.businessName} (${workspace.workspaceId})\n`));
    }

    // Update FAQs
    let updatedWorkspace = null;
    let updatedClient = null;

    if (workspace) {
      console.log(chalk.blue(`📝 Updating workspace FAQs...`));
      updatedWorkspace = await workspaceService.updateFAQs(workspace.workspaceId, faqs);
      if (updatedWorkspace) {
        console.log(chalk.green(`✅ Workspace FAQs updated: ${updatedWorkspace.faqs?.length || 0} FAQ(s)\n`));
      } else {
        console.error(chalk.red(`❌ Failed to update workspace FAQs\n`));
      }
    }

    if (client) {
      console.log(chalk.blue(`📝 Updating client FAQs (backward compatibility)...`));
      updatedClient = await clientService.updateFAQs(client.clientId, faqs);
      if (updatedClient) {
        console.log(chalk.green(`✅ Client FAQs updated: ${updatedClient.faqs?.length || 0} FAQ(s)\n`));
      } else {
        console.error(chalk.red(`❌ Failed to update client FAQs\n`));
      }
    }

    // Summary
    console.log(chalk.cyan('📊 Summary:'));
    if (updatedWorkspace) {
      console.log(chalk.gray(`   Workspace: ${updatedWorkspace.workspaceId}`));
      console.log(chalk.gray(`   FAQs: ${updatedWorkspace.faqs?.length || 0}`));
    }
    if (updatedClient) {
      console.log(chalk.gray(`   Client: ${updatedClient.clientId}`));
      console.log(chalk.gray(`   FAQs: ${updatedClient.faqs?.length || 0}`));
    }
    console.log(chalk.green(`\n✅ FAQs seeded successfully!\n`));
    console.log(chalk.blue('💡 Next steps:'));
    console.log(chalk.gray('   1. Go to your dashboard FAQs page'));
    console.log(chalk.gray('   2. Verify the FAQs are displayed correctly'));
    console.log(chalk.gray('   3. Test the bot by sending messages with keywords\n'));

  } catch (error) {
    console.error(chalk.red('❌ Seed failed:'), error);
    process.exit(1);
  } finally {
    await disconnectFromMongoDB();
  }
}

seedFAQs();
