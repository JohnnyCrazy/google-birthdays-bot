import { people_v1 } from 'googleapis';

export function birthdayMessage({
  birthday,
  person,
}: {
  birthday: people_v1.Schema$Birthday;
  person: people_v1.Schema$Person;
}) {
  const year = birthday.date?.year ? ` (${new Date().getFullYear() - birthday.date.year})` : '';

  return `🎂 It's ${person.names?.[0]?.displayName ?? 'Unkown'}'s birthday today${year}`;
}
