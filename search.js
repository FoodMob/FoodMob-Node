function main() {

    //gets the restaurants near the location
    function getRestaurants(location) {
        var restaurants = [{ restaurant: { name: "Moe's", categories: ["Mexican", "Vegitarian"] }, score: 50 },
            { restaurant: { name: "Five Guys", categories: ["Hamburgers", "American"] }, score: 50 },
            { restaurant: { name: "Seafood World", categories: ["Shellfish", "Sushi", "Seafood"]}, score: 50 }];
        return restaurants;
    }

    //searches the restaurants near the location that best fit the user's criteria and ranks them
    function search(users, location) {

        var restaurants = getRestaurants(location);

        var likes = [];
        var dislikes = [];
        var allergies = [];

        //combine user criteria
        for (var j = 0; j < users.length; j++) {
            u = users[j];
            if (u.food_profile.likes) {
                likes = likes.concat(u.food_profile.likes);
            }
            if (u.food_profile.dislikes) {
                dislikes = dislikes.concat(u.food_profile.dislikes);
            }
            if (u.food_profile.allergies) {
                allergies = allergies.concat(u.food_profile.allergies);
            }
        }
        //calculate the score for each restaurant
        console.log("Likes: " + likes);
        console.log("Disikes: " + dislikes);
        console.log("Allergies: " + allergies);
        for (var i = 0; i < restaurants.length; i++) {
            var categories = restaurants[i].restaurant.categories;
            var scoreChange = 0;
            for (var k = 0; k < categories.length; k++) {
                var c = categories[k];
                if (likes.indexOf(c) != -1) {
                    var count = 0;
                    for (var x = 0; x < likes.length; x++) {
                        if (likes[x] == c) {
                            count++;
                        }
                    }
                    scoreChange -= (5 * count);
                }
                if (dislikes.indexOf(c) != -1) {
                    var count = 0;
                    for (var x = 0; x < dislikes.length; x++) {
                        if (dislikes[x] == c) {
                            count++;
                        }
                    }
                    scoreChange += (5 * count);
                }
                if (allergies.indexOf(c) != -1) {
                    var count = 0;
                    for (var x = 0; x < allergies.length; x++) {
                        if (allergies[x] == c) {
                            count++;
                        }
                    }
                    scoreChange += (25 * count);
                }
            }
            restaurants[i].score += scoreChange;
        }
        //sort the restaurants
        restaurants.sort(function (a, b) {
            return a.score - b.score;
        });
        console.log(restaurants);
    }

    var users = [
        { name: "Evan", food_profile: { likes: ["Pizza", "Hamburgers", "Mexican"], dislikes: ["Sushi"], allergies: ["Shellfish"] }, email: "evanneenan@yahoo.com" },
        { name: "Bob", food_profile: { likes: ["Seafood", "Mexican"], dislikes: ["Hamburgers"], allergies: [] }, email: "robert@bob.com" }
    ]

    search(users);
};

main();