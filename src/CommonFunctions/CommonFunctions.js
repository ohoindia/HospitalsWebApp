export const formatDate = (dobString) => {
    const date = new Date(dobString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);
};

export function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
};