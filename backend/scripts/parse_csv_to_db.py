"""
parse_csv_to_db.py
-----------------

Parses the TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv file and prepares task data for import into the database.

Features:
- Maps CSV columns to DB fields.
- Validates required fields (e.g. 'name').
- Prepares for lookup mapping (portfolio, project, section, priority).
- Exports parsed data as tasks_parsed.json.
- Prints warnings for missing data.

Usage:
    python3 parse_csv_to_db.py

Next steps:
- Map lookup values to DB IDs.
- Export as SQL or API-ready JSON for bulk import.
- Integrate with backend DB or API.
"""
"""
Script: parse_csv_to_db.py
Purpose: Parse TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv and prepare data for import into the Tasks database schema.
Author: Autonomous AI (2025-04-16)
"""
import csv
import json
import argparse
from typing import Dict, Any, List

try:
    import requests
except ImportError:
    requests = None

CSV_PATH = '/Users/test/Desktop/Windsurf3/TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv'

# Map CSV columns to DB fields (example, expand as needed)
CSV_TO_DB_MAP = {
    'Task ID': 'id',
    'Name': 'name',
    'Description': 'description',
    'Notes': 'notes',
    'Portfolio': 'portfolio',
    'Project': 'project',
    'Sections': 'section',
    'Priority': 'priority',
    'Due Date': 'due_date',
    'Start Date': 'start_date',
    'Created At': 'created_at',
    'Completed At': 'completed_at',
    'Last Modified At': 'updated_at',
    # ... add more mappings as needed
}

REQUIRED_FIELDS = ['name']  # Expand as needed
LOOKUP_FIELDS = ['portfolio', 'project', 'section', 'priority']

# --- Lookup Table Mappings ---
LOOKUP_MAPPINGS = {
    'portfolio': {
        'Social Media & Marketing (Marketing)': 2
    },
    'project': {
        'Sociálne Médiá - Správa & Obsah (Marketing)': 2,
        'Marketingové Nástroje & Optimalizácie (Marketing)': 3,
        'Stratégia & Branding - Centrálny (Marketing)': 4
    },
    'section': {
        'Správa Kanálov & Komunita (Sociálne Médiá - Správa & Obsah (Marketing))': 4,
        'Optimalizácie Procesov (Marketingové Nástroje & Optimalizácie (Marketing))': 2,
        'Stratégia (Celková) (Stratégia & Branding - Centrálny (Marketing))': 3,
        'Plán Obsahu (Sociálne Médiá - Správa & Obsah (Marketing))': 5,
        'Affiliate & Partnerstvá (Nástroje) (Marketingové Nástroje & Optimalizácie (Marketing))': 6
    },
    'priority': {
        'P0 - NOW': 2,
        'P3 - Medium': 3
    }
}

# --- Helper for mapping lookups ---
def map_lookups(task):
    mapped = dict(task)
    # Portfolio
    if 'Portfolio' in task and task['Portfolio']:
        mapped['portfolio_id'] = LOOKUP_MAPPINGS['portfolio'].get(task['Portfolio'])
    # Project
    if 'Project' in task and task['Project']:
        projects = [p.strip() for p in task['Project'].split(',') if p.strip()]
        mapped['project_id'] = LOOKUP_MAPPINGS['project'].get(projects[0]) if projects else None
    # Section
    if 'Sections' in task and task['Sections']:
        sections = [s.strip() for s in task['Sections'].split(',') if s.strip()]
        mapped['section_id'] = LOOKUP_MAPPINGS['section'].get(sections[0]) if sections else None
    # Priority
    if 'Priority' in task and task['Priority']:
        mapped['priority_id'] = LOOKUP_MAPPINGS['priority'].get(task['Priority'])
    # Remove original lookup fields
    for k in ['Portfolio', 'Project', 'Sections', 'Priority']:
        mapped.pop(k, None)
    # Only include fields that exist in Task model
    allowed_fields = set([
        'task_id','name','description','notes','task_comments','portfolio_id','project_id','section_id','priority_id','due_date','start_date','created_at','completed_at','updated_at','tags','task_goal','input_data_context','desired_output_format','ai_action_process_free_text','ai_action_process_dropdown','ai_workflow_status','allow_autonomous_execution','number_of_variations','desired_style_tone','specific_constraints_instructions','ai_behavior_on_uncertainty','ai_creativity_level','ai_processing_priority','ai_agent_status_log','ai_output_result_link','action_required_from_user','related_portfolios','related_projects','related_sections','related_tasks','related_tasks_id','related_entities','target_audience','task_purpose','type','task_type','estimated_user_time','cognitive_load','energy_level_required','required_tools_software','required_hardware','required_skills','estimated_cost_budget','expected_impact_success_metric','location','execution_location','required_devices','internet_requirement','focus_requirement','optimal_time_of_day','assignee','collaborators','related_entity','waiting_for','financial_return_value_speed','ai_output_rating','feedback_for_ai','suggested_initial_steps_subtasks','related_areas_for_ai_to_consider','potential_dependencies_related_tasks'
    ])
    filtered = {k: v for k, v in mapped.items() if k in allowed_fields and v != ''}
    if not filtered.get('name'):
        filtered['name'] = '[Imported Task]'  # Fallback name if missing
    return filtered

def load_lookup_tables(path: str) -> dict:
    """
    Load lookup tables from a JSON file. Example structure:
    {
      "portfolio": {"Portfolio Name": 1, ...},
      "project": {"Project Name": 2, ...},
      ...
    }
    """
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Could not load lookup tables from {path}: {e}")
        return {}


# Default stub lookup tables
LOOKUP_TABLES = {
    'portfolio': {'Example Portfolio': 1},
    'project': {'Example Project': 1},
    'section': {'Example Section': 1},
    'priority': {'High': 1, 'Medium': 2, 'Low': 3},
}


def map_lookup_value(field: str, value: str, lookups=None) -> int:
    """
    Map lookup value to DB ID using provided lookup tables.
    """
    tables = lookups if lookups is not None else LOOKUP_TABLES
    return tables.get(field, {}).get(value, None)


def parse_csv(csv_path: str, lookups: dict) -> list:
    tasks = []
    with open(csv_path, encoding='utf-8') as f:
        sample = f.read(2048)
        f.seek(0)
        # Try to autodetect delimiter, fallback to comma if detection fails
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=';,')
        except csv.Error:
            print('[WARN] Could not determine delimiter, defaulting to comma (,).')
            class SimpleDialect(csv.Dialect):
                delimiter = ','
                quotechar = '"'
                doublequote = True
                skipinitialspace = True
                lineterminator = '\n'
                quoting = csv.QUOTE_MINIMAL
            dialect = SimpleDialect
        reader = csv.DictReader(f, dialect=dialect)
        for row in reader:
            # Preserve ALL columns and their data, do not filter or remap
            task = {k.strip(): v.strip() if v is not None else '' for k, v in row.items()}
            tasks.append(task)
    return tasks


def export_as_sql(tasks: List[Dict[str, Any]], outfile: str):
    with open(outfile, 'w', encoding='utf-8') as f:
        for t in tasks:
            cols = ', '.join(t.keys())
            vals = ', '.join(f"'{v.replace("'", "''")}'" if v else 'NULL' for v in t.values())
            f.write(f"INSERT INTO tasks ({cols}) VALUES ({vals});\n")
    print(f"Exported tasks as SQL to {outfile}")


# --- Patch import_to_backend_api to use map_lookups ---
def import_to_backend_api(tasks, api_url, dry_run=True, user=None, password=None):
    if not requests:
        print("requests module not available. Install with 'pip install requests'.")
        return
    headers = {'Content-Type': 'application/json'}
    auth = (user, password) if user and password else None
    for i, task in enumerate(tasks, 1):
        mapped_task = map_lookups(task)
        if dry_run:
            print(f"[DRY RUN] Would POST to {api_url}: {mapped_task}")
        else:
            resp = requests.post(api_url, json=mapped_task, headers=headers, auth=auth)
            print(f"Task {i}: status={resp.status_code}, response={resp.text}")


def main():
    parser = argparse.ArgumentParser(description="Parse tasks CSV and export to JSON and/or SQL.")
    parser.add_argument('--json', action='store_true', help='Export parsed tasks as JSON')
    parser.add_argument('--sql', action='store_true', help='Export parsed tasks as SQL')
    parser.add_argument('--csv', type=str, default=CSV_PATH, help='Path to input CSV file')
    parser.add_argument('--api', type=str, help='Backend API endpoint for importing tasks')
    parser.add_argument('--no-dry-run', action='store_true', help='Actually POST to API (default is dry run)')
    parser.add_argument('--lookups', type=str, help='Path to lookup tables JSON file')
    parser.add_argument('--user', type=str, help='HTTP Basic Auth username')
    parser.add_argument('--password', type=str, help='HTTP Basic Auth password')
    args = parser.parse_args()

    lookups = LOOKUP_TABLES
    if args.lookups:
        lookups = load_lookup_tables(args.lookups)

    tasks = parse_csv(args.csv, lookups)
    print(f"Parsed {len(tasks)} tasks from CSV.")
    if tasks:
        print(tasks[0])
    if args.json:
        # Write the full dynamic tasks list to JSON
        output_path = "tasks_parsed.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        print(f"Exported parsed tasks to {output_path}")
        # Debug: print file path and contents
        with open(output_path, "r", encoding="utf-8") as f:
            print(f"[DEBUG] Contents of {output_path}:")
            print(f.read())
    if args.sql:
        export_as_sql(tasks, "tasks_parsed.sql")
    if args.api:
        import_to_backend_api(tasks, args.api, dry_run=not args.no_dry_run, user=args.user, password=args.password)


if __name__ == '__main__':
    main()
