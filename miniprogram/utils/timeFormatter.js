const dayjs = require('dayjs');

function timeFormatter(timestamp) {
	const thisYear = new Date().getFullYear();
	const thisDay = new Date().getDate();
	const year = dayjs(timestamp).format('YYYY');
	const day = dayjs(timestamp).format('DD');
	if(thisDay == day) {
		return dayjs(timestamp).format('hh:mm');
	} else if(thisYear == year) {
		return dayjs(timestamp).format('MM-DD HH:mm');
	} else {
		return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
	}
}

module.exports = {
	timeFormatter
}