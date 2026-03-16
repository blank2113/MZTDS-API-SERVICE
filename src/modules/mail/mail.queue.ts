import { mailingQueue } from "../../queues/mailing.queue.js";
import {
  mailService,
  SendCustomMailOptions,
  TemplateOptions,
} from "./mail.service.js";

export interface EmailQueueJob {
  type: "welcome" | "reset-password" | "custom";
  to: string;
  subject: string;
  name?: string;
  resetLink?: string;
  template?: TemplateOptions;
}

/**
 * Queue welcome email to be sent asynchronously
 */
export async function queueWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  await mailingQueue.add("email", {
    type: "welcome",
    to,
    subject: "Добро пожаловать!",
    name,
  } as EmailQueueJob);
}

/**
 * Queue password reset email to be sent asynchronously
 */
export async function queueResetPasswordEmail(
  to: string,
  name: string,
  resetLink: string,
): Promise<void> {
  await mailingQueue.add("email", {
    type: "reset-password",
    to,
    subject: "Сброс пароля",
    name,
    resetLink,
  } as EmailQueueJob);
}

/**
 * Queue custom email to be sent asynchronously
 */
export async function queueCustomEmail(
  options: SendCustomMailOptions,
): Promise<void> {
  await mailingQueue.add("email", {
    type: "custom",
    to: options.to,
    subject: options.subject || "Уведомление",
    template: options.template,
  } as EmailQueueJob);
}

/**
 * Send email immediately (without queue)
 */
export async function sendEmailImmediately(job: EmailQueueJob): Promise<void> {
  try {
    const { type, to, subject, name, resetLink, template } = job;

    if (type === "welcome") {
      await mailService.sendWelcomeMail(to, name!);
    } else if (type === "reset-password") {
      await mailService.sendResetPasswordMail(to, name!, resetLink!);
    } else if (type === "custom") {
      await mailService.sendCustomMail({
        to,
        subject: subject || "Уведомление",
        template: template!,
      });
    }
  } catch (error) {
    console.error(`Failed to send email:`, error);
    throw error;
  }
}

export { mailService };
