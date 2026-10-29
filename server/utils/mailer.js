// Изпращане на имейли.
//
// - Ако в .env има RESEND_API_KEY -> писмото се праща наистина през Resend (https://resend.com).
// - Ако няма (например докато разработваш) -> писмото само се печата в терминала на сървъра,
//   така че можеш да копираш линка оттам, без да настройваш нищо.

const RESEND_URL = 'https://api.resend.com/emails';

// to: получател, subject: тема, text: обикновен текст, html: красивата версия на писмото.
async function sendMail({ to, subject, text, html }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.log('\n========== ИМЕЙЛ (не е изпратен — липсва RESEND_API_KEY) ==========');
        console.log(`До: ${to}\nТема: ${subject}\n\n${text}`);
        console.log('====================================================================\n');
        return;
    }

    const response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Адресът на подателя трябва да е от домейн, потвърден в Resend.
            from: process.env.MAIL_FROM || 'TrapBlade <onboarding@resend.dev>',
            to,
            subject,
            text,
            html,
        }),
    });

    if (!response.ok) {
        throw new Error(`Resend върна ${response.status}: ${await response.text()}`);
    }
}

module.exports = {
    sendMail,
}
