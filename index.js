let express = require('express'),
	request = require('request'),
	cors = require('cors');

const lcboKey = "MDowMTRiMWQ1MC1mMDI1LTExZTgtYTYyMC0wMzU4ODQ0Y2UwNjI6eDN4V29ST01BdEZ4aWdXYVVLNkFtdEhUbWhaQUFVR3JRNkgz",
	apiUrl = "http://lcboapi.com";

let router = express.Router();
let app = express();

app.use(cors());

app.get('/stores', (req, res) => {

	let searchParams = req.query;

	if(!searchParams.product_id) {
		res.json({error: 'Product ID param missing'});
		return false;
	}
	if(!searchParams.lat) {
		res.json({error: 'lat param missing'});
		return false;
	}
	if(!searchParams.lng) {
		res.json({error: 'lng param missing'});
		return false;
	}
	let {lat: lat, lng: lng, product_id: product_id} = req.query;

	request.get({
	    url: `${apiUrl}/stores`,
	    qs: {
	        access_key: lcboKey,
	        lat: lat,
	        lon: lng,
	        product_id: product_id
	    }
	}, (err, httpResponse, body) => {
		console.log(httpResponse);
		if(httpResponse.statusCode !== 200) {
			res.json({error: 'Could not fetch store results'});
		}
		res.json({searchParams: searchParams, results: JSON.parse(body).result});
	})
});

app.get('/products', (req, res) => {

	let searchParams = req.query;
	
	if(!searchParams.search_term) {
		res.json({error: 'Search param missing'});
		return false;
	}
	request.get({
	    url: `${apiUrl}/products`,
	    qs: {
	        access_key: lcboKey,
	        q: searchParams.search_term
	    }
	}, (err, httpResponse, body) => {
		if(httpResponse.statusCode !== 200) {
			res.json({error: 'Could not fetch product results'});
		}
		res.json({searchParams: searchParams, results: JSON.parse(body).result});
	})
});

app.listen(8081, () => {
	console.log('API listening on port 8081');
});