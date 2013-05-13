/*
LINE 1
Field	Columns	Content
1		01–01	Line number
2		03–07	Satellite number
3		08–08	Classification (U=Unclassified)
4		10–11	International Designator (Last two digits of launch year)
5		12–14	International Designator (Launch number of the year)
6		15–17	International Designator (Piece of the launch)
7		19–20	Epoch Year (Last two digits of year)
8		21–32	Epoch (Day of the year and fractional portion of the day)
9		34–43	First Time Derivative of the Mean Motion divided by two[clarification needed]
10		45–52	Second Time Derivative of Mean Motion divided by six (decimal point assumed)
11		54–61	BSTAR drag term (decimal point assumed)
12		63–63	The number 0 (Originally this should have been "Ephemeris type")
13		65–68	Element number
14		69–69	Checksum (Modulo 10)

LINE 2
Field	Columns	Content
1		01–01	Line number
2		03–07	Satellite number
3		09–16	Inclination [Degrees]
4		18–25	Right Ascension of the Ascending Node [Degrees]
5		27–33	Eccentricity (decimal point assumed)
6		35–42	Argument of Perigee [Degrees]
7		44–51	Mean Anomaly [Degrees]
8		53–63	Mean Motion [Revs per day]
9		64–68	Revolution number at epoch [Revs]
10		69–69	Checksum (Modulo 10)

*/

define(
	[
		'orbit/NameSpace'
	],
	function(ns) {
	

		return function(str) {

			return {

			};

		}

	}
);
