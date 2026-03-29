
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { z } from 'zod';

const UpdateSubscriptionInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  newPlan: z.string().min(1, 'New plan is required.'),
});

export async function updateSubscription(input: z.infer<typeof UpdateSubscriptionInputSchema>): Promise<{ success: boolean; error: string | null }> {
  if (!db) {
    return { success: false, error: 'Configuration Firestore manquante. Impossible de mettre à jour l\'abonnement.' };
  }
  const validation = UpdateSubscriptionInputSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: 'Invalid input: ' + validation.error.message };
  }

  const { userId, newPlan } = validation.data;

  try {
    const userDocRef = doc(db, 'users', userId);
    
    const isTrial = newPlan.toLowerCase().includes('essai gratuit');
    const isPayAsYouGo = newPlan.toLowerCase().includes('pay-as-you-go');

    const getEndDate = () => {
        const date = new Date();
        if (isTrial) {
            date.setDate(date.getDate() + 7);
        } else if (newPlan.toLowerCase().includes('mensuel')) {
            date.setMonth(date.getMonth() + 1);
        } else if (newPlan.toLowerCase().includes('trimestriel')) {
            date.setMonth(date.getMonth() + 3);
        } else if (newPlan.toLowerCase().includes('semestriel')) {
            date.setMonth(date.getMonth() + 6);
        } else if (newPlan.toLowerCase().includes('annuel')) {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            return null; // For Pay-As-You-Go or other non-expiring plans
        }
        return date;
    }

    const subscriptionUpdate: any = {
      'subscription.plan': newPlan,
      'subscription.status': 'active',
      'subscription.isTrial': isTrial,
      'subscription.startDate': serverTimestamp(),
      'subscription.endDate': getEndDate(),
    };

    if (isPayAsYouGo) {
        subscriptionUpdate['subscription.credits'] = increment(10);
    }


    await updateDoc(userDocRef, subscriptionUpdate);
    
    console.log(`Successfully updated subscription for user ${userId} to ${newPlan}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message || 'Could not update subscription in Firestore.' };
  }
}
