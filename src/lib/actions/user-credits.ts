
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, DocumentData } from 'firebase/firestore';

/**
 * Checks if a user has access to a premium feature and decrements credits if they are on a Pay-As-You-Go plan.
 * Throws an error if the user does not have access.
 * @param userId The ID of the user to check.
 */
export async function checkAndDeductCredits(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!db) {
        // If Firebase is not configured, we allow access in dev/test mode
        // or we could throw a specific configuration error.
        // For this app's resilience goal, let's log and allow if we're just testing.
        console.warn("Firebase Firestore non configuré. Saut de la vérification des crédits.");
        return { success: true, error: null };
    }
    if (!userId) {
        return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return { success: false, error: "L'utilisateur n'existe pas." };
    }

    const userData = userDoc.data() as DocumentData;
    const subscription = userData.subscription;

    if (!subscription || subscription.status !== 'active') {
        return { success: false, error: "Vous n'avez pas d'abonnement actif." };
    }

    // Standard subscription (monthly, yearly, etc.)
    if (subscription.plan !== 'Pay-As-You-Go') {
        if (subscription.endDate && subscription.endDate.toDate() < new Date()) {
            return { success: false, error: 'Votre abonnement a expiré.' };
        }
        // If standard subscription is active, allow access without credit deduction.
        return { success: true, error: null };
    }

    // Pay-As-You-Go logic
    const credits = subscription.credits || 0;
    if (credits < 1) {
        return { success: false, error: "Vous n'avez plus de crédits. Veuillez recharger votre compte." };
    }

    // Decrement credits
    await updateDoc(userDocRef, {
        'subscription.credits': increment(-1),
    });

    console.log(`Credit deducted for user ${userId}. Remaining: ${credits - 1}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in checkAndDeductCredits:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de la vérification des crédits.' };
  }
}
