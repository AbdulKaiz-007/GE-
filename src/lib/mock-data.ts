
export function generateMockPGs(lat: number, lng: number, count: number = 8) {
    const prefixes = ["Royal", "Student", "Comfort", "Elite", "Cozy", "Urban", "Metro", "Campus", "Scholar's", "Youth"]
    const suffixes = ["Residency", "Inn", "Living", "Nest", "Hub", "Stay", "House", "Villa", "Corner", "Point"]

    const amenitiesList = ["WiFi", "AC", "Food", "Laundry", "Gym", "Power Backup", "Housekeeping", "TV", "Refrigerator"]

    return Array.from({ length: count }).map((_, i) => {
        // Random offset within ~1-2km
        const latOffset = (Math.random() - 0.5) * 0.02
        const lngOffset = (Math.random() - 0.5) * 0.02

        const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
        const price = Math.floor(Math.random() * (20000 - 5000) + 5000)

        // Weighted random for gender to make "Co-living" less common if desired, or equal
        const genders = ["Boys", "Girls", "Co-living"]
        const gender = genders[Math.floor(Math.random() * genders.length)]

        // Random amenities (3-6 items)
        const shuffledAmenities = [...amenitiesList].sort(() => 0.5 - Math.random())
        const amenities = shuffledAmenities.slice(0, Math.floor(Math.random() * 4) + 3)

        return {
            id: Date.now() + i,
            name,
            location: "Nearby Sector", // Could be more specific if we had reverse geocoding
            distance: `${(Math.sqrt(latOffset ** 2 + lngOffset ** 2) * 111).toFixed(1)}km`,
            price,
            gender,
            amenities,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            lat: lat + latOffset,
            lng: lng + lngOffset,
            image: `https://images.unsplash.com/photo-${[
                "1555854877-bab0e564b8d5",
                "1522771753062-5887739948c0",
                "1596276020587-8044fe049813",
                "1505691938895-1758d7feb511",
                "1513694203232-719a280e022f",
                "1540518614846-7eded433c457",
                "1591825729269-caeb344f6df2",
                "1493809842364-78817add7ffb"
            ][Math.floor(Math.random() * 8)]}?auto=format&fit=crop&q=80&w=300&h=200`
        }
    })
}
