'use server';

/**
 * Server Actions - Gestion des Accès (SessionParticipant)
 * CRUD complet pour gérer les accès utilisateurs aux sessions
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ParticipantRole } from '@prisma/client';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Récupérer tous les accès
 */
export async function getAccesses(): Promise<ActionResult> {
  try {
    const accesses = await prisma.sessionParticipant.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { select: { id: true, title: true, status: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return { success: true, data: accesses };
  } catch (error) {
    console.error('Error fetching accesses:', error);
    return { success: false, error: 'Erreur lors de la récupération des accès' };
  }
}

/**
 * Récupérer les accès d'une session spécifique
 */
export async function getSessionAccesses(sessionId: string): Promise<ActionResult> {
  try {
    const accesses = await prisma.sessionParticipant.findMany({
      where: { sessionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return { success: true, data: accesses };
  } catch (error) {
    console.error('Error fetching session accesses:', error);
    return { success: false, error: 'Erreur lors de la récupération des accès' };
  }
}

/**
 * Ajouter un accès
 */
export async function addAccess(
  userId: string,
  sessionId: string,
  role: ParticipantRole = 'PARTICIPANT'
): Promise<ActionResult> {
  try {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // Vérifier que la session existe
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      return { success: false, error: 'Session introuvable' };
    }

    // Vérifier si l'accès existe déjà
    const existing = await prisma.sessionParticipant.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existing) {
      return { success: false, error: 'Cet utilisateur a déjà accès à cette session' };
    }

    // Créer l'accès
    const access = await prisma.sessionParticipant.create({
      data: { userId, sessionId, role },
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { select: { id: true, title: true } },
      },
    });

    revalidatePath('/admin/access');
    return { success: true, data: access };
  } catch (error) {
    console.error('Error adding access:', error);
    return { success: false, error: "Erreur lors de l'ajout de l'accès" };
  }
}

/**
 * Modifier un accès (changer le rôle)
 */
export async function updateAccess(
  accessId: string,
  role: ParticipantRole
): Promise<ActionResult> {
  try {
    const access = await prisma.sessionParticipant.update({
      where: { id: accessId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { select: { id: true, title: true } },
      },
    });

    revalidatePath('/admin/access');
    return { success: true, data: access };
  } catch (error) {
    console.error('Error updating access:', error);
    return { success: false, error: "Erreur lors de la modification de l'accès" };
  }
}

/**
 * Supprimer un accès (révoquer)
 */
export async function deleteAccess(accessId: string): Promise<ActionResult> {
  try {
    await prisma.sessionParticipant.delete({
      where: { id: accessId },
    });

    revalidatePath('/admin/access');
    return { success: true };
  } catch (error) {
    console.error('Error deleting access:', error);
    return { success: false, error: "Erreur lors de la suppression de l'accès" };
  }
}

/**
 * Supprimer tous les accès d'un utilisateur
 */
export async function revokeAllUserAccesses(userId: string): Promise<ActionResult> {
  try {
    const result = await prisma.sessionParticipant.deleteMany({
      where: { userId },
    });

    revalidatePath('/admin/access');
    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error('Error revoking all accesses:', error);
    return { success: false, error: 'Erreur lors de la révocation des accès' };
  }
}

/**
 * Récupérer les utilisateurs sans accès à une session spécifique
 */
export async function getUsersWithoutAccess(sessionId: string): Promise<ActionResult> {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          sessionRoles: {
            some: { sessionId },
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users without access:', error);
    return { success: false, error: 'Erreur' };
  }
}
