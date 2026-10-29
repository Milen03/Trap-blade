// Текстовете на имейлите, които сайтът праща. Всяка функция връща { subject, text, html }.

// Името идва от потребителя — екранираме го, за да не може някой да вкара HTML в писмото.
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function resetPasswordEmail({ firstName, link, minutes }) {
    const hello = firstName ? `Здравей, ${firstName}!` : 'Здравей!';

    const text = [
        hello,
        '',
        'Получихме заявка за смяна на паролата ти в TrapBlade.',
        `Отвори този линк, за да избереш нова парола (важи ${minutes} минути):`,
        link,
        '',
        'Ако не си поискал(а) смяна на паролата, просто игнорирай това писмо — паролата ти остава същата.',
    ].join('\n');

    const htmlHello = firstName ? `Здравей, ${escapeHtml(firstName)}!` : 'Здравей!';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
            <h2 style="margin-bottom: 8px;">TrapBlade</h2>
            <p>${htmlHello}</p>
            <p>Получихме заявка за смяна на паролата ти.</p>
            <p>
                <a href="${link}" style="display: inline-block; background: #5cbefd; color: #0a0a0a;
                   padding: 12px 24px; text-decoration: none; font-weight: bold;">
                    Избери нова парола
                </a>
            </p>
            <p style="font-size: 13px; color: #555;">Линкът важи ${minutes} минути и може да се ползва само веднъж.</p>
            <p style="font-size: 13px; color: #555;">
                Ако не си поискал(а) смяна на паролата, просто игнорирай това писмо — паролата ти остава същата.
            </p>
        </div>`;

    return { subject: 'Смяна на паролата в TrapBlade', text, html };
}

module.exports = {
    resetPasswordEmail,
}
