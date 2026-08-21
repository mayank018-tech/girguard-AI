import re

dashboard_path = 'src/pages/DashboardPage.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    dash = f.read()

# Fix className
dash = re.sub(
    r'className=\{"h-1\.5 rounded-full.*?\}',
    'className={h-1.5 rounded-full }',
    dash
)
dash = re.sub(
    r'className=\{h-1\.5 rounded-full \}"\}',
    'className={h-1.5 rounded-full }',
    dash
)
with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(dash)

forest_path = 'src/pages/ForestCommandPage.jsx'
with open(forest_path, 'r', encoding='utf-8') as f:
    forest = f.read()

# Fix the JSX adjacent elements error. I probably missed replacing something or added an extra closing tag.
forest = forest.replace('{320} />}', '{320} />')
forest = forest.replace('height={320} />}', 'height={320} />}')

# Let's just fix it completely by putting it inside a fragment
forest = forest.replace('          {!villages || !sightings || !hotspots || !teams ? <div className="h-[400px] flex items-center justify-center"><LoadingSpinner /></div> : <GirMap villages={villages} sightings={sightings} hotspots={hotspots} teams={teams} height={320} />', '          {!villages || !sightings || !hotspots || !teams ? <div className="h-[400px] flex items-center justify-center"><LoadingSpinner /></div> : <GirMap villages={villages} sightings={sightings} hotspots={hotspots} teams={teams} height={320} /> }')

with open(forest_path, 'w', encoding='utf-8') as f:
    f.write(forest)

print("Fixed JSX syntax")
