export interface ScoringInput {
  request: {
    bloodGroup: string;
    unitsRequired: number;
    urgency: string;
  };
  bloodBank: {
    latitude: number;
    longitude: number;
  };
  donors: Array<{
    id: string;
    fullName: string;
    latitude: number;
    longitude: number;
    lastDonationDate: Date | null;
    nextEligibleDate: Date | null;
    totalDonations: number;
    lastActiveAt: Date | null;
    responses: Array<{
      response: string; // "AVAILABLE" | "UNAVAILABLE"
    }>;
  }>;
}

export interface ScoredDonor {
  id: string;
  fullName: string;
  distance: number;
  lastDonationDate: Date | null;
  totalDonations: number;
  score: number;
  breakdown: {
    eligibility: number;
    distance: number;
    responseRate: number;
    donationHistory: number;
    activityBonus: number;
  };
}

export class PriorityScoringService {
  /**
   * Calculates scores and ranks eligible donors.
   * Isolating the ranking logic under this single signature enables 
   * seamless transitions to Machine Learning scoring systems in the future.
   */
  public static rankDonors(input: ScoringInput): ScoredDonor[] {
    const scoredList: ScoredDonor[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const donor of input.donors) {
      // 1. Eligibility Check (Exclude entirely if next eligible date is in future)
      const isEligible = !donor.nextEligibleDate || new Date(donor.nextEligibleDate) <= today;
      if (!isEligible) {
        continue;
      }
      const eligibilityScore = 40; // Eligible matches get baseline 40 points

      // 2. Distance Scoring (Haversine distance in km)
      const distance = this.calculateDistance(
        input.bloodBank.latitude,
        input.bloodBank.longitude,
        donor.latitude,
        donor.longitude
      );

      let distanceScore = 0;
      if (distance <= 2) distanceScore = 25;
      else if (distance <= 5) distanceScore = 20;
      else if (distance <= 10) distanceScore = 15;
      else if (distance <= 15) distanceScore = 10;
      else if (distance <= 20) distanceScore = 5;
      else distanceScore = 0;

      // 3. Response Rate (Total Emergency Requests / Accepted Emergency Requests)
      const totalResponses = donor.responses.length;
      const acceptedResponses = donor.responses.filter(
        (r) => r.response === "AVAILABLE"
      ).length;

      let responseRateScore = 10; // Default neutral (50% -> 10 points out of 20)
      if (totalResponses > 0) {
        responseRateScore = Math.round((acceptedResponses / totalResponses) * 20);
      }

      // 4. Donation History
      let historyScore = 0;
      const totalDonations = donor.totalDonations;
      if (totalDonations >= 10) historyScore = 10;
      else if (totalDonations >= 5) historyScore = 8;
      else if (totalDonations >= 3) historyScore = 6;
      else if (totalDonations === 2) historyScore = 4;
      else if (totalDonations === 1) historyScore = 2;
      else historyScore = 0;

      // 5. Activity Bonus (Based on lastActiveAt timestamps)
      let activityScore = 2; // Default neutral score
      if (donor.lastActiveAt) {
        const lastActive = new Date(donor.lastActiveAt);
        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) activityScore = 5;
        else if (diffDays <= 90) activityScore = 3;
        else activityScore = 1;
      }

      const totalScore =
        eligibilityScore +
        distanceScore +
        responseRateScore +
        historyScore +
        activityScore;

      scoredList.push({
        id: donor.id,
        fullName: donor.fullName,
        distance: Math.round(distance * 10) / 10,
        lastDonationDate: donor.lastDonationDate,
        totalDonations: donor.totalDonations,
        score: totalScore,
        breakdown: {
          eligibility: eligibilityScore,
          distance: distanceScore,
          responseRate: responseRateScore,
          donationHistory: historyScore,
          activityBonus: activityScore,
        },
      });
    }

    // Sort descending by score, and break ties by distance (closer is better)
    return scoredList.sort((a, b) => b.score - a.score || a.distance - b.distance);
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
