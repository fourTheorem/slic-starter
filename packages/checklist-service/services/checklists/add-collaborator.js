import { addCollaborator } from './checklist.js';

/**
 * Handle an "Add collaborator" CloudWatch Event
 */
export async function main(event) {
  return addCollaborator(event.detail);
}
