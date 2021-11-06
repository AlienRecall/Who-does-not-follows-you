/*
Wrttien by AlienRecall (https://twitter.com/AlienRecall)
Discord: -~#1709
Githb: https://github.com/AlienRecall
*/

const userID = document.getElementsByTagName('html')[0].innerHTML.match(/"id":"(.*?)"/)[1];
const followersCount = document.getElementsByTagName('html')[0].innerHTML.match(/"userInteractionCount":"(.*?)"/)[1];

const getFollowing = async () => {
  let req = await fetch("https://i.instagram.com/api/v1/friendships/" + userID + "/following/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,it;q=0.7",
      "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-asbd-id": "198387",
      "x-ig-app-id": "936619743392459",
      "x-ig-www-claim": "hmac.AR1PeL_U0P8_rP2CHUTV_x6aUk18NAV7Qgdq2sbNbTlceeP-"
    },
    "referrer": "https://www.instagram.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });
  return await req.json()
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//credits to valentin-matzke on this question (https://stackoverflow.com/questions/57369262/is-there-a-way-to-get-the-follower-list-of-an-instagram-account) 
const getFollowers = async (userFollowerCount) => {
  let userFollowers = [],
    batchCount = 20,
    actuallyFetched = 20,
    url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables={"id":"${userID}","include_reel":true,"fetch_mutual":true,"first":"${batchCount}"}`;
  while (userFollowerCount > 0) {
    const followersResponse = await fetch(url)
      .then(res => res.json())
      .then(res => {
        const nodeIds = [];
        for (const node of res.data.user.edge_followed_by.edges) {
          nodeIds.push(node.node);
        }
        actuallyFetched = nodeIds.length;
        return {
          edges: nodeIds,
          endCursor: res.data.user.edge_followed_by.page_info.end_cursor
        };
      }).catch(err => {
        userFollowerCount = -1;
        return {
          edges: []
        };
      });
    await sleep(300);
    userFollowers = [...userFollowers, ...followersResponse.edges];
    userFollowerCount -= actuallyFetched;
    url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables={"id":"${userID}","include_reel":true,"fetch_mutual":true,"first":${batchCount},"after":"${followersResponse.endCursor}"}`;
  }
  return userFollowers;
};

console.log("Loading your following users...")
let following = await getFollowing();
console.log("Loading your followers users...")
let followers = await getFollowers(parseInt(followersCount));

let followersUsernames = [];
followers.forEach(element => {
  followersUsernames.push(element.username);
})

let followingUsernames = [];
following.users.forEach(element => {
  followingUsernames.push(element.username);
})

console.log("Retrinving results...")
followingUsernames.forEach(element => {
  if (!followersUsernames.includes(element)) {
    console.log(element);
  }
})
