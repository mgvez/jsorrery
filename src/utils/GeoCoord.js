

export default class {
	constructor(lat = 0, lng = 0) {
		this.lat = lat;
		this.lng = lng;
	}

	getLoc() {
		return { lat: this.lat, lng: this.lng };
	}

	getString() {
		return `${this.lat.toFixed(4)}, ${this.lng.toFixed(4)}`;
	}

	setValue({ lat, lng }) {
		this.lat = lat;
		this.lng = lng;
	}

	setFromString(str) {
		// console.log(str);
		//40° 26′ 46″ N 79° 58′ 56″ W.
		const degrees = str.match(/([\d]+)°?\s+([\d.]+)[′`']?\s+([\d.]+)[″"]?\s+(N|S)\s+([\d]+)°?\s+([\d.]+)[′`']?\s+([\d.]+)[″"]\s+(W|E)/i, str);
		
		// console.log(degrees);
		if (degrees) {
			return this.setLatLng(
				Number(degrees[1]) + (Number(degrees[2]) / 60) + (Number(degrees[3]) / 3600),
				Number(degrees[5]) + (Number(degrees[6]) / 60) + (Number(degrees[7]) / 3600),
				degrees[4],
				degrees[8]
			);
		}

		//40° 26.767′ N 79° 58.933′ W
		const minutesDecimal = str.match(/([\d]+)°?\s+([\d.]+)[′`']?\s+(N|S)\s+([\d]+)°?\s+([\d.]+)[′`']?\s+(W|E)/i, str);
		//
		if (minutesDecimal) {
			return this.setLatLng(
				Number(minutesDecimal[1]) + (Number(minutesDecimal[2]) / 60),
				Number(minutesDecimal[4]) + (Number(minutesDecimal[5]) / 60),
				minutesDecimal[3],
				minutesDecimal[6]
			);
		}

		//40.446° N 79.982° W
		const decimal = str.match(/([\d.-]+)°?[\s,]?(N|S)?\s{1,}([\d.-]+)°?\s?(W|E)?/i, str);
		// console.log(decimal);
	
		if (decimal) {
			return this.setLatLng(
				Number(decimal[1]),
				Number(decimal[3]),
				decimal[2],
				decimal[4]
			);
		}

		return this.getLoc();
		
	}

	setLatLng(lat, lng, latHemisphere = '', lngHemisphere = '') {

		this.lat = lat;
		this.lng = lng;

		if ((latHemisphere.toLowerCase() === 's' && this.lat > 0) || (latHemisphere.toLowerCase() === 'n' && this.lat < 0)) this.lat *= -1;

		if ((lngHemisphere.toLowerCase() === 'w' && this.lng > 0) || (lngHemisphere.toLowerCase() === 'e' && this.lng < 0)) this.lng *= -1;
		// console.log(this.lat, this.lng);
		return this.getLoc();
		
	}


}
