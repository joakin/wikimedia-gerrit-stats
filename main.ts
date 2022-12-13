#!/usr/bin/env -S deno run --allow-net --allow-write=./data --allow-read=./data

interface GerritChange {
  created: string;
  insertions: number;
  deletions: number;
  _more_changes?: true;
}

interface ChangesStatsByString {
  [key: string]: ChangesStats;
}

interface ChangesStats {
  Changes: number;
  Insertions: number;
  Deletions: number;
  "Ins + Del LoC": number;
}

if (import.meta.main) {
  const cmd = Deno.args[0];
  switch (cmd) {
    case "fetch-changes": {
      const user = Deno.args[1];
      if (!user) throw new Error("No user passed in as an argument");
      await fetchAndWriteChanges(user);
      break;
    }
    case "changes-per-project": {
      const user = Deno.args[1];
      if (!user) throw new Error("No user passed in as an argument");
      const changes = await fetchCachedChanges(user);

      const projects: ChangesStatsByString = {};

      for (const change of changes) {
        if (!projects[change.project]) {
          projects[change.project] = {
            Changes: 0,
            Insertions: 0,
            Deletions: 0,
            "Ins + Del LoC": 0,
          };
        }
        const project = projects[change.project];
        project.Changes += 1;
        project.Insertions += change.insertions;
        project.Deletions += change.deletions;
        project["Ins + Del LoC"] += change.insertions + change.deletions;
      }
      addTotal(projects);

      console.table(projects);
      break;
    }
    case "changes-per-year": {
      const user = Deno.args[1];
      if (!user) throw new Error("No user passed in as an argument");
      const changes: GerritChange[] = await fetchCachedChanges(user);
      changes.sort((a, b) =>
        a.created > b.created ? 1 : a.created === b.created ? 0 : -1
      );

      const yearMonths: ChangesStatsByString = {};

      for (const change of changes) {
        const creationDate = new Date(change.created + "Z");
        const year = String(creationDate.getUTCFullYear());
        const month = String(creationDate.getUTCMonth() + 1).padStart(2, "0");
        const creationYearMonth = `${year}-${month}`;

        if (!yearMonths[creationYearMonth]) {
          yearMonths[creationYearMonth] = {
            Changes: 0,
            Insertions: 0,
            Deletions: 0,
            "Ins + Del LoC": 0,
          };
        }
        const project = yearMonths[creationYearMonth];
        project.Changes += 1;
        project.Insertions += change.insertions;
        project.Deletions += change.deletions;
        project["Ins + Del LoC"] += change.insertions + change.deletions;
      }

      const years: ChangesStatsByString = {};
      for (const change of changes) {
        const creationDate = new Date(change.created + "Z");
        const year = String(creationDate.getUTCFullYear());

        if (!years[year]) {
          years[year] = {
            Changes: 0,
            Insertions: 0,
            Deletions: 0,
            "Ins + Del LoC": 0,
          };
        }
        const project = years[year];
        project.Changes += 1;
        project.Insertions += change.insertions;
        project.Deletions += change.deletions;
        project["Ins + Del LoC"] += change.insertions + change.deletions;
      }

      addTotal(years);

      console.table(yearMonths);
      console.table(years);
      break;
    }
    default: {
      console.log(`\
USAGE:
    fetch-changes [USERNAME|EMAIL]
    changes-per-project [USERNAME|EMAIL]
    changes-per-year [USERNAME|EMAIL]
`);
    }
  }
}

async function fetchChanges(
  user: string,
  start: number | null = null,
  changes: GerritChange[] = []
) {
  const startParam = start ? `&start=${start}` : "";
  const url = `https://gerrit.wikimedia.org/r/changes/?q=owner:${user}${startParam}`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  const text = await res.text();
  const json: GerritChange[] = JSON.parse(text.slice(5));
  changes.push(...json);

  if (changes.length > 0 && changes[changes.length - 1]._more_changes) {
    await fetchChanges(user, (start ?? 0) + json.length, changes);
  }
  return changes;
}

async function fetchAndWriteChanges(user: string) {
  const json = await fetchChanges(user);
  console.log(`Found ${json.length} entries`);
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(json, null, 2));
  const path = changesPath(user);
  await Deno.writeFile(path, data);
  console.log(`Wrote them to ${path}`);
}

function changesPath(user: string) {
  return `./data/changes-${user}.json`;
}

async function fetchCachedChanges(user: string) {
  const decoder = new TextDecoder("utf-8");
  let data;
  try {
    data = await Deno.readFile(changesPath(user));
  } catch (_) {
    await fetchAndWriteChanges(user);
    data = await Deno.readFile(changesPath(user));
  }
  const text = decoder.decode(data);
  return JSON.parse(text);
}

function addTotal(stats: ChangesStatsByString) {
  const total: ChangesStats = {
    Changes: 0,
    Insertions: 0,
    Deletions: 0,
    "Ins + Del LoC": 0,
  };
  for (const row of Object.values(stats)) {
    total.Changes += row.Changes;
    total.Insertions += row.Insertions;
    total.Deletions += row.Deletions;
    total["Ins + Del LoC"] += row.Insertions + row.Deletions;
  }
  stats["total"] = total;
}
