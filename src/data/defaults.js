var defaults = [
    // {
    //     "name": "Anonymous Only",
    //     "abbreviation": "anon",
    //     "forceAnonymity": true,
    //     "posts": [{
    //         "subject": "Welcome to /anon/ - Anonymous Only",
    //         "body": "This board will only allow you to post with the anonymouse user session ids. No usernames or principals are allowed.",
    //     }]
    // },
    {
        "name": "Random",
        "abbreviation": "p",
        "isShownInHeader": true,
        "textOnly": true,
        "posts": [{
            "subject": "Welcome to /p/ - Random",
            "body": `The is a public alpha board where users can converse with each other through text, and eventually files. 
Seachan is in an early alpha phase so many of the \"nice to have\" features like quoting, quick reply, and greentext are still in development.`,
            "isStickied": true,
        }]
    },
    // {
    //     "name": "Business and Finance",
    //     "abbreviation": "biz",
    //     "isShownInHeader": true,
    //     "posts": [{
    //         "subject": "Welcome to /biz/ - Business and Finance",
    //         "body": "This board is for the discussion of topics related to business, economics, financial markets, securities, currencies (including cryptocurrencies), commodities, etc -- as well as topics relating to starting and running a business.\n\nDiscussions of government policy must be strictly limited to economic policies (fiscal and monetary). Discussions of a political nature should be posted on >>>/pol/.",
    //         "filePath": "https://ipfs.infura.io/ipfs/bafkreidlocx25igo7fg6xkq2hjkbaptftbiioavuls4ik7sdfn2xarwuba",
    //         "fileType": "image",
    //         "fileName": "biz.jpg",
    //         "fileSize": 591_109,
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Fitness",
    //     "abbreviation": "fit",
    //     "isShownInHeader": true,
    //     "posts": [{
    //         "subject": "Welcome to /fit/ - Fitness",
    //         "body": "",
    //     }]
    // },
    // {
    //     "name": "Technology",
    //     "abbreviation": "g",
    //     "isShownInHeader": true,
    //     "posts": [{
    //         "subject": "Welcome to /g/ - Technology",
    //         "body": "",
    //         "filePath": "https://ipfs.infura.io/ipfs/bafkreidfw4crve3jff2f3rd4wtxyctnqe2666klkripknwurvc564a3zae",
    //         "fileType": "image",
    //         "fileName": "1594686818586.png",
    //         "fileSize": 228_264,
    //     }]
    // },
    {
        "name": "Meta",
        "abbreviation": "meta",
        "isShownInHeader": true,
        "textOnly": true,
        "posts": [

            {
                "subject": "Feature requests",
                "body": "List your feature requests here.",
                "isStickied": true,
            },
            {
                "subject": "FAQ - Frequently Asked Questions",
                "body": "",
                "isStickied": true,
                "replies": [
                    {
                        "body": "how to donate?",
                    },
                    {
                        "body": "tech stack?",
                    },
                    {
                        "body": "supported file types?",
                    },
                    {
                        "body": "github repo?",
                    },
                ]
            },
            {
                "subject": "File Type Demos",
                "body": "Demos of the various supported file types.",
                "isStickied": true,
                "replies": [
                    {
                        "body": "jpeg",
                    },
                    {
                        "body": "png",
                    },
                    {
                        "body": "jfif",
                    },
                    {
                        "body": "gif",
                    },
                    {
                        "body": "svg",
                    },
                    {
                        "body": "mp4",
                    },
                    {
                        "body": "mov",
                    },
                    {
                        "body": "webm",
                    },
                    {
                        "body": "mp3",
                    },
                    {
                        "body": "wav",
                    },
                    {
                        "body": "flac",
                    },
                    {
                        "body": "pdf",
                    },
                    {
                        "body": "txt",
                    },
                ]
            },
            {
                "subject": "Bug Reporting",
                "body": "Report bugs here",
                "isStickied": true,
            },
            {
                "subject": "Site Updates",
                "body": "I will occasionally post updates on the development on Seachan here",
                "isStickied": true,
                "replies": [
                    {
                        "body": `20220624: Getting ready for Seachan Alpha release. 
We will be starting with six boards:
/p/ - Random: an open text-only board that anyone can post in.
/icplb/ - ICPlebeian: 1 ICP gated board (Plug wallet required).
/icptn/ - ICPlebeian: 1000 ICP gated board (Plug wallet required).
/jpeg/ - NFT Holders: Must own one of any ICP-based NFT (Plug wallet required and NFT must be on DAB registry).
/motoko/ - Motoko Holders: Must own one Notoko NFT (Plug wallet required).
/meta/ - Meta: Information about Seachan.`
                    }
                ]
            },

            {
                "subject": "Welcome to /meta/ - Meta",
                "body": "This board pertains to Seachan itself",
                "isStickied": true,
            },
        ]
    },
    // {
    //     "name": "Politics",
    //     "abbreviation": "pol",
    //     "showFlags": true,
    //     "isInDevelopment": true,
    //     "isShownInHeader": true,
    //     "posts": [{
    //         "subject": "Welcome to /pol/ - Politics",
    //         "body": "This board is for the discussion of news, world events, political issues, and other related topics.\n\nOff-topic and /b/-tier threads will be deleted (and possibly earn you a ban, if you persist). Unless they are quality, well thought out, well written posts, the following are some examples of off-topic and/or /b/-tier threads:\n\n>Red pill me on X. (with no extra content or input of your own)\n>Are X white?\n>Is X degeneracy?\n>How come X girls love Y guys so much?\n>If X is true, then how come Y? Checkmate Z.\n\nThe variety of threads allowed here are very flexible and we believe in freedom of speech, but we expect a high level of discourse befitting of the board. Attempts to disrupt the board will not be tolerated, nor will calls to disrupt other boards and sites.",
    //         "filePath": "https://ipfs.infura.io/ipfs/QmTtKw1g12iZgfGMjq3x7sWLwXtgAvMrb7fRCPULdPzcbU",
    //         "fileType": "image",
    //         "fileName": "pol.jpg",
    //         "fileSize": 750_553,
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Raffles and Games",
    //     "abbreviation": "rng",
    //     "isInDevelopment": true,
    //     "posts": [{
    //         "subject": "Welcome to /rng/ - Raffles and Games",
    //         "body": "This board will be used to hold raffles and other games based on ICP tokens and NFTs.",
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Sports",
    //     "abbreviation": "sp",
    //     "posts": [{
    //         "subject": "Welcome to /sp/ - Sports",
    //         "body": "",
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Video Games",
    //     "abbreviation": "vg",
    //     "posts": [{
    //         "subject": "Welcome to /vg/ - Video Games",
    //         "body": "",
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Text Only",
    //     "abbreviation": "txt",
    //     "textOnly": true,
    //     "posts": [{
    //         "subject": "Welcome to /tog/ - Text Only General",
    //         "body": "The text-only board for any topic. No file uploads are allowed.",
    //         "isStickied": true,
    //     }]
    // },
    // {
    //     "name": "Gated with Password",
    //     "abbreviation": "pwd",
    //     "isGated": true,
    //     "gateType": "password",
    //     "isInDevelopment": true,
    //     "posts": [{
    //         "subject": "",
    //         "body": "This board will require a text password access.",
    //         "isStickied": true,
    //     }]
    // },
    {
        "name": "ICP Gate",
        "abbreviation": "icp",
        "isGated": true,
        "gateType": "tokens",
        "gateToken": "ICP",
        "gateTokenAmount": 10,
        "posts": [{
            "subject": "Welcome to /icplb/ - ICPlebeian",
            "body": "You must own 10 ICP to gain access this board.",
            "isStickied": true,
        }]
    },
    // {
    //     "name": "ICPatrician",
    //     "abbreviation": "icptn",
    //     "isGated": true,
    //     "gateType": "tokens",
    //     "gateToken": "ICP",
    //     "gateTokenAmount": 1000,
    //     "posts": [{
    //         "subject": "Welcome to /icptn/ - ICPatrician",
    //         "body": "You must own 1000 ICP to gain access this board.",
    //         "isStickied": true,
    //     }]
    // },
    {
        "name": "NFT Holders",
        "abbreviation": "jpeg",
        "isGated": true,
        "gateType": "nft",
        "gateToken": "",
        "posts": [{
            "subject": "Welcome to /nft/ - NFT Holders",
            "body": "You must own one DAB registered NFT to access this board.",
            "isStickied": true,
        }]
    },
    {
        "name": "Motoko Holders",
        "abbreviation": "motoko",
        "isGated": true,
        "gateType": "nft",
        "gateToken": "Motoko Day Drop",
        "posts": [{
            "subject": "Welcome to /motoko/ - Motoko Holders",
            "body": "You must own one Motoko NFT to access this board.",
            "isStickied": true,
        }]
    },
    // {
    //     "name": "Bug Bounty",
    //     "abbreviation": "bug",
    //     "isGated": true,
    //     "isInDevelopment": true,
    // },
    {
        "name": "Unlisted",
        "abbreviation": "unlisted",
        "isListed": false,
        "posts": [{
            "subject": "This is an unlisted board",
            "body": "This board does not appear on the seachan home page board list."
        }]
    }
]

export { defaults };