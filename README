# wikimedia gerrit stats

Ever wondered the amount of lines of code you have submitted in your changes to Gerrit? What kind of projects you have contributed to? When you have submitted more and less patches through time?

If you have, this script is for you.

It uses [deno](https://deno.land/), and you can run it like this:

```
→ ./main.ts
USAGE:
    fetch-changes [USERNAME|EMAIL]
    changes-per-project [USERNAME|EMAIL]
    changes-per-year [USERNAME|EMAIL]

→ ./main.ts changes-per-project rmoen
Fetching https://gerrit.wikimedia.org/r/changes/?q=owner:rmoen
Found 488 entries
Wrote them to ./data/changes-rmoen.json
┌──────────────────────────────────────┬─────────┬────────────┬───────────┬───────────────┐
│ (idx)                                │ Changes │ Insertions │ Deletions │ Ins + Del LoC │
├──────────────────────────────────────┼─────────┼────────────┼───────────┼───────────────┤
│ operations/mediawiki-config          │       5 │         51 │         2 │            53 │
│ mediawiki/extensions/QuickSurveys    │      14 │        671 │       158 │           829 │
│              ...                     │     ... │        ... │       ... │           ... │
│ mediawiki/extensions/MoodBar         │       2 │          8 │         8 │            16 │
│ mediawiki/extensions/WikiEditor      │       3 │         11 │         8 │            19 │
│ total                                │     488 │      47304 │      9959 │         57263 │
└──────────────────────────────────────┴─────────┴────────────┴───────────┴───────────────┘

→ ./main.ts changes-per-year jhobs
Fetching https://gerrit.wikimedia.org/r/changes/?q=owner:jhobs
Found 103 entries
Wrote them to ./data/changes-jhobs.json
┌─────────┬─────────┬────────────┬───────────┬───────────────┐
│ (idx)   │ Changes │ Insertions │ Deletions │ Ins + Del LoC │
├─────────┼─────────┼────────────┼───────────┼───────────────┤
│ 2014-09 │       2 │         97 │        66 │           163 │
│ 2014-10 │       6 │        797 │       421 │          1218 │
│ 2014-11 │       3 │         77 │        35 │           112 │
│     ... │     ... │        ... │       ... │           ... │
│ 2016-11 │       9 │        921 │       360 │          1281 │
│ 2016-12 │       2 │        261 │       254 │           515 │
│ 2017-01 │       1 │         18 │         7 │            25 │
└─────────┴─────────┴────────────┴───────────┴───────────────┘
┌───────┬─────────┬────────────┬───────────┬───────────────┐
│ (idx) │ Changes │ Insertions │ Deletions │ Ins + Del LoC │
├───────┼─────────┼────────────┼───────────┼───────────────┤
│ 2014  │      14 │        977 │       523 │          1500 │
│ 2015  │      44 │       1521 │       622 │          2143 │
│ 2016  │      44 │       2320 │      1088 │          3408 │
│ 2017  │       1 │         18 │         7 │            25 │
│ total │     103 │       4836 │      2240 │          7076 │
└───────┴─────────┴────────────┴───────────┴───────────────┘
```

Data fetched is cached in the `./data` folder. To get fresh data either remove the json file you want to re-fetch, or use the command `fetch-changes`:

```
→ ./main.ts fetch-changes rmoen
Fetching https://gerrit.wikimedia.org/r/changes/?q=owner:rmoen
Found 488 entries
Wrote them to ./data/changes-rmoen.json
```
