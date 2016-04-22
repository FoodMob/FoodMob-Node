"use strict";

const _ = require('underscore');
const Promise = require("bluebird");
const YelpAPI = require("yelp");
const yelp = new YelpAPI({
    consumer_key: "ztr7KhVSTTlJrTyWIs_oGw",
    consumer_secret: "LTUP8B_0FRX2bZJLKASyJv1AoIQ",
    token: "SCewHkhbYrGOpvAVUyeBkZDt5w2pTb90",
    token_secret: "uhNwNTtszPD0v7BwyU8pJne_nPg"
});

module.exports.searchYelp = function(terms, location, cll, ll, otherOptions) {
    if (!location && !ll) {
        return Promise.reject("Either a location of a lat/long needs to be given");
    }
    let options;
    if (location) {
        if (cll) {
            options = {
                term: terms,
                location: location,
                cll: cll
            };
        } else {
            options = {
                term: terms,
                location: location
            };
        }
    } else {
        options = {
            term: terms,
            ll: ll
        };
    }

    _.extend(options, otherOptions);
    console.log("options",options);
    return yelp.search(options);
};