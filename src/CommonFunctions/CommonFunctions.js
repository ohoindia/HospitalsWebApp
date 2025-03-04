export const formatDate = (dobString) => {
    const date = new Date(dobString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);
};