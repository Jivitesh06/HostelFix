#!/usr/bin/env node

/**
 * HostelFix — Chitkara University Mess Menu Provisioner & Updater
 *
 * Updates the weekly mess schedule in the database to match the official
 * Chitkara University Office of Food & Beverage dining schedule across all 7 days (28 meal slots):
 *   - Breakfast, Lunch, Evening Tea & Snacks, Dinner for Monday through Sunday.
 *
 * Idempotently updates existing slots (preserving student feedbacks) or inserts new ones.
 *
 * Usage:
 *   node scripts/update-mess-menu.js
 *   npm run db:update:menu
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHITKARA_MESS_MENU = [
  // ── Monday ─────────────────────────────────────────────────────────────────
  {
    day: 'Monday',
    mealType: 'BREAKFAST',
    items: 'Aloo Paratha, Butter, Pickle, Tea & Curd',
  },
  {
    day: 'Monday',
    mealType: 'LUNCH',
    items: 'Dal Makhani, Seasonal Vegetable, Boondi Raita, Salad, Rice, Wheat Roti',
  },
  {
    day: 'Monday',
    mealType: 'SNACKS',
    items: 'Tea & Sandwich',
  },
  {
    day: 'Monday',
    mealType: 'DINNER',
    items: 'Chana Dal, Mix Veg, Salad, Jeera Rice, Wheat Roti & Suji Halwa',
  },

  // ── Tuesday ────────────────────────────────────────────────────────────────
  {
    day: 'Tuesday',
    mealType: 'BREAKFAST',
    items: 'Poori, Aloo Channa / Bread Butter & Tea',
  },
  {
    day: 'Tuesday',
    mealType: 'LUNCH',
    items: 'Sabut Masoor, Chilli Potato, Salad, Rice, Wheat Roti & Curd',
  },
  {
    day: 'Tuesday',
    mealType: 'SNACKS',
    items: 'Cold Coffee & Veg Pasta / Namkeen',
  },
  {
    day: 'Tuesday',
    mealType: 'DINNER',
    items: 'White Chana, Seasonal Vegetable, Pickle, Plain Rice, Wheat Roti',
  },

  // ── Wednesday ──────────────────────────────────────────────────────────────
  {
    day: 'Wednesday',
    mealType: 'BREAKFAST',
    items: 'Poha, Sweet Daliya, Black Chana Chat, Tea, Fruit',
  },
  {
    day: 'Wednesday',
    mealType: 'LUNCH',
    items: 'Rajma Masala, Aloo Shimla Mirch / Aloo Baingan Masala, Raita, Wheat Roti, Rice & Salad',
  },
  {
    day: 'Wednesday',
    mealType: 'SNACKS',
    items: 'Tea & Stuffed Kulcha / Coleslaw Sandwich',
  },
  {
    day: 'Wednesday',
    mealType: 'DINNER',
    items: 'Moong Dhuli Dal, Variety of Paneer / Paneer Bhurji, Salad, Jeera Rice, Wheat Roti & Gulab Jamun',
  },

  // ── Thursday ───────────────────────────────────────────────────────────────
  {
    day: 'Thursday',
    mealType: 'BREAKFAST',
    items: 'Pav Bhaji, Tea',
  },
  {
    day: 'Thursday',
    mealType: 'LUNCH',
    items: 'Kadhi Pakora, Aloo Jeera, Wheat Roti, Salad, Rice',
  },
  {
    day: 'Thursday',
    mealType: 'SNACKS',
    items: 'Tea & Biscuits / Veg Macaroni',
  },
  {
    day: 'Thursday',
    mealType: 'DINNER',
    items: 'Dal Arhar, Lauki Kofta / Veg Manchurian, Salad, Jeera Rice / Fried Rice, Wheat Roti & Semiyan Kheer / Rice Kheer',
  },

  // ── Friday ─────────────────────────────────────────────────────────────────
  {
    day: 'Friday',
    mealType: 'BREAKFAST',
    items: 'Plain Paratha / Mix Paratha, Aloo Masala, Pickle & Tea',
  },
  {
    day: 'Friday',
    mealType: 'LUNCH',
    items: 'Black Chana, Hara Kaddu, Poori, Raita, Salad, Rice',
  },
  {
    day: 'Friday',
    mealType: 'SNACKS',
    items: 'Nimbu Pani / Rooh Afza & Bhelpuri (Packed)',
  },
  {
    day: 'Friday',
    mealType: 'DINNER',
    items: 'Sabut Moong, Matar Mushroom / Soya Chaap Masala, Salad, Rice, Wheat Roti',
  },

  // ── Saturday ───────────────────────────────────────────────────────────────
  {
    day: 'Saturday',
    mealType: 'BREAKFAST',
    items: 'Matar Kulcha & Tea',
  },
  {
    day: 'Saturday',
    mealType: 'LUNCH',
    items: 'Rajma Masala & Aloo Nutri Beans, Salad, Raita, Rice, Wheat Roti',
  },
  {
    day: 'Saturday',
    mealType: 'SNACKS',
    items: 'Tea & Samosa',
  },
  {
    day: 'Saturday',
    mealType: 'DINNER',
    items: 'Mix Dal, Matar Aloo, Chilli Potato, Salad, Rice, Wheat Roti & Fruit Custard',
  },

  // ── Sunday ─────────────────────────────────────────────────────────────────
  {
    day: 'Sunday',
    mealType: 'BREAKFAST',
    items: 'Poha, Cornflakes With Milk / Sweet Daliya, Tea, Fruit',
  },
  {
    day: 'Sunday',
    mealType: 'LUNCH',
    items: 'Chana Amritsari, Bhature, Rice, Raita, Green Chutney, Pickle & Tea',
  },
  {
    day: 'Sunday',
    mealType: 'SNACKS',
    items: 'Tea & Chips',
  },
  {
    day: 'Sunday',
    mealType: 'DINNER',
    items: 'Chana Mah Dal, Paneer & Egg Curry (2 Pcs) / Egg Bhurji (Once a Month), Salad, Rice, Wheat Roti',
  },
];

async function updateMessMenu() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       Chitkara University — Weekly Mess Menu Provisioner        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Compute Monday of current week
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  let updatedCount = 0;
  let createdCount = 0;

  for (const item of CHITKARA_MESS_MENU) {
    // Find all existing entries for this day and mealType
    const existingList = await prisma.messMenu.findMany({
      where: {
        dayOfWeek: item.day,
        mealType: item.mealType,
      },
      orderBy: { weekOf: 'desc' },
    });

    if (existingList.length > 0) {
      // Update primary existing record with official items and current week date
      const primary = existingList[0];
      await prisma.messMenu.update({
        where: { id: primary.id },
        data: {
          items: item.items,
          weekOf: monday,
        },
      });
      updatedCount++;

      // If duplicate slots exist from previous seeds, clean them up safely
      if (existingList.length > 1) {
        for (let i = 1; i < existingList.length; i++) {
          const dup = existingList[i];
          // Re-link any feedback to primary slot before deleting duplicate
          await prisma.menuFeedback.updateMany({
            where: { messMenuId: dup.id },
            data: { messMenuId: primary.id },
          });
          await prisma.messMenu.delete({
            where: { id: dup.id },
          });
        }
      }
    } else {
      // Create new slot
      await prisma.messMenu.create({
        data: {
          dayOfWeek: item.day,
          mealType: item.mealType,
          items: item.items,
          weekOf: monday,
        },
      });
      createdCount++;
    }

    console.log(`  ✓ [${item.day}] ${item.mealType.padEnd(9)}: ${item.items.slice(0, 48)}...`);
  }

  const totalSlots = await prisma.messMenu.count();

  console.log('\n──────────────────────────────────────────────────────────────────');
  console.log(`✅ Success: ${updatedCount} updated, ${createdCount} created.`);
  console.log(`📊 Total Active Mess Menu Slots: ${totalSlots} (Expected: 28)`);
  console.log('──────────────────────────────────────────────────────────────────\n');
}

if (require.main === module) {
  updateMessMenu()
    .catch((err) => {
      console.error('[Error] Updating mess menu failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  updateMessMenu,
  CHITKARA_MESS_MENU,
};
