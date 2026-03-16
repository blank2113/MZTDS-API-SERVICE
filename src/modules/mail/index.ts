// Main exports
export {
  mailService,
  type TemplateOptions,
  type TemplateButton,
  type TemplateMetaItem,
  type SendCustomMailOptions,
} from "./mail.service.js";

// Queue functions
export {
  queueWelcomeEmail,
  queueResetPasswordEmail,
  queueCustomEmail,
  sendEmailImmediately,
  type EmailQueueJob,
} from "./mail.queue.js";
