// Създава грешка с HTTP статус, която errorHandler ще върне на клиента такава, каквато е.
// Пример: throw httpError(400, 'Липсва имейл');
function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

// Последният middleware в Express — тук стигат всички грешки, подадени с next(err).
// Клиентът винаги получава JSON във вида { message: '...' }.
function errorHandler(err, req, res, next) {
    // Грешки от валидацията в модела (например твърде къса парола).
    if (err.name === 'ValidationError') {
        const firstError = Object.values(err.errors)[0];
        res.status(400)
            .json({ message: firstError.message });
        return;
    }

    // Дублиран уникален ключ в MongoDB (например вече регистриран имейл).
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
        const message = field === 'email'
            ? 'Този имейл вече е регистриран'
            : 'Такъв профил вече съществува';
        res.status(409)
            .json({ message });
        return;
    }

    // Грешки, създадени с httpError(...) — съобщението им е предназначено за потребителя.
    if (err.status) {
        if (err.status >= 500) {
            console.error(err.stack);
        }
        res.status(err.status)
            .json({ message: err.message });
        return;
    }

    // Всичко останало е неочаквано: пишем го в конзолата, а на клиента казваме общо съобщение.
    console.error(err.stack)
    res.status(500)
        .json({ message: 'Нещо се обърка. Опитай отново.' })
}

module.exports = {
    errorHandler,
    httpError,
};
