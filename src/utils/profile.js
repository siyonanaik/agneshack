const PROFILE_KEY = 'mediclear_profile';

export function getProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profileData) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // silently fail
  }
}

export function getProfileAvatar(profile) {
  if (!profile) return null;
  if (profile.avatar) return profile.avatar;
  const name = profile.fullName || profile.firstName || 'U';
  return name.charAt(0).toUpperCase();
}