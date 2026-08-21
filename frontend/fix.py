import re

dashboard_path = 'src/pages/DashboardPage.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    dash = f.read()

dash = re.sub(
    r'className=\{"h-1\.5 rounded-full.*?\}',
    'className={h-1.5 rounded-full }',
    dash
)
dash = re.sub(
    r'style=\{\{ width: \$\{r\.riskScore\}\% \}\}',
    'style={{ width: ${r.riskScore}% }}',
    dash
)

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(dash)

print("Fixed dashboard")
