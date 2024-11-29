export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const formatDateShort = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const formatDateISO = (date: Date): string => {
    return date.toISOString().slice(0, 16);
}; 