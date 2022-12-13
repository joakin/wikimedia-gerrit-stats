#!/usr/bin/env -S deno run --allow-net --allow-write=./data --allow-read=./data

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
      const decoder = new TextDecoder("utf-8");
      let data;
      try {
        data = await Deno.readFile(changesPath(user));
      } catch (_) {
        await fetchAndWriteChanges(user);
        data = await Deno.readFile(changesPath(user));
      }
      const text = decoder.decode(data);
      const json = JSON.parse(text);

      // console.log(json[0]);
      const projects: {
        [key: string]: {
          changes: number;
          insertions: number;
          deletions: number;
          total: number;
        };
      } = {};
      const total = {
        changes: 0,
        insertions: 0,
        deletions: 0,
        total: 0,
      };

      for (const change of json) {
        if (!projects[change.project]) {
          projects[change.project] = {
            changes: 0,
            insertions: 0,
            deletions: 0,
            total: 0,
          };
        }
        const project = projects[change.project];
        project.changes += 1;
        total.changes += 1;
        project.insertions += change.insertions;
        total.insertions += change.insertions;
        project.deletions += change.deletions;
        total.deletions += change.deletions;
        project.total += change.insertions + change.deletions;
        total.total += change.insertions + change.deletions;
      }
      projects["total"] = total;

      console.table(projects);
      break;
    }
    default: {
      console.log(`\
USAGE:
    fetch-changes [USERNAME|EMAIL]
    changes-per-project [USERNAME|EMAIL]
`);
    }
  }
}

async function fetchAndWriteChanges(user: string) {
  const res = await fetch(
    `https://gerrit.wikimedia.org/r/changes/?q=owner:${user}`
  );
  const text = await res.text();
  const json = JSON.parse(text.slice(5));
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
