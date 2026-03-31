// Written by Tommy Truong

export const mapPassenger = (data) => {
    if (!data) return null;

    return {
        passengerId: data.passenger_id ?? data.passengerId,

        firstName: data.first_name || data.firstName,
        middleInitial: data.middle_initial || data.middleInitial || null,
        lastName: data.last_name || data.lastName,

        dateOfBirth: data.date_of_birth || data.dateOfBirth,
        
        isLoyaltyMember: (data.is_loyalty_member ?? data.isLoyaltyMember) == 1,
        loyaltyMiles: data.loyalty_miles ?? data.loyaltyMiles ?? 0,

        gender: data.gender,
        
        phoneNumber: data.phone_number || data.phoneNumber || null,
        
        passportNumber: data.passport_number ?? data.passportNumber ?? null,
        passportCountry: data.passport_country || data.passportCountry || null,
        passportExpiration: data.passport_expiration || data.passportExpiration || null,

        knownTravelerNumber: data.known_traveler_number ?? data.knownTravelerNumber ?? null,
        
        createdDatetime: data.created_datetime || data.createdDatetime,
        lastUpdatedDatetime: data.last_updated_datetime || data.lastUpdatedDatetime,

        isPrimary: (data.is_primary ?? data.isPrimary) == 1 ?? null,
        relationship: data.relationship || null
    };
};

export const mapSearchCriteria = (data) => {
    if (!data) return null;

    return {
        firstName: data.first_name || data.firstName || null,
        middleInitial: data.middle_initial || data.middleInitial || null,
        lastName: data.last_name || data.lastName || null,

        dateOfBirth: data.date_of_birth || data.dateOfBirth || null,
        
        isLoyaltyMember: (data.isLoyaltyMember ?? data.is_loyalty_member) !== undefined ? 
                         (data.isLoyaltyMember ?? data.is_loyalty_member) : null,

        gender: data.gender ?? null,
        
        phoneNumber: data.phone_number || data.phoneNumber || null,

        passportNumber: data.passport_number ?? data.passportNumber ?? null,
        passportCountry: data.passport_country || data.passportCountry || null,

        knownTravelerNumber: data.known_traveler_number ?? data.knownTravelerNumber ?? null
    }
};