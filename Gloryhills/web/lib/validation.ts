import {kinds, mediaEditorAllowedKinds, requiredWhenPublished, contentInput, submissionInput} from './validation.mjs';
import type {z} from 'zod';

export {kinds, mediaEditorAllowedKinds, requiredWhenPublished, contentInput, submissionInput};
export type ContentInput = z.infer<typeof contentInput>;
export type SubmissionInput = z.infer<typeof submissionInput>;
