from typing import Optional, List
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel

# --- Lookup Tables ---
class Portfolio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    projects: List["Project"] = Relationship(back_populates="portfolio")

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    portfolio_id: Optional[int] = Field(default=None, foreign_key="portfolio.id")
    portfolio: Optional[Portfolio] = Relationship(back_populates="projects")
    sections: List["Section"] = Relationship(back_populates="project")

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    project: Optional[Project] = Relationship(back_populates="sections")

class Priority(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None

# --- TaskTagLink (for many-to-many Task <-> Tag) ---
# class TaskTagLink(SQLModel, table=True):
#     task_id: Optional[int] = Field(default=None, foreign_key="task.id", primary_key=True)
#     tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    # tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTagLink)

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: Optional[str] = Field(default=None, index=True, description="Unique Task ID")
    name: str
    description: Optional[str] = None
    notes: Optional[str] = None
    task_comments: Optional[str] = None
    portfolio_id: Optional[int] = Field(default=None, foreign_key="portfolio.id")
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    section_id: Optional[int] = Field(default=None, foreign_key="section.id")
    priority_id: Optional[int] = Field(default=None, foreign_key="priority.id")
    parent_task: Optional[str] = None
    parent_task_id: Optional[str] = None
    subtasks_for_user: Optional[str] = None
    subtasks_for_ai: Optional[str] = None
    subtasks_in_system: Optional[str] = None
    subtasks_id_in_system: Optional[str] = None
    ai_brainstorm_ideas: Optional[str] = None
    dependents: Optional[str] = None
    dependents_id: Optional[str] = None
    outgoing_dependents: Optional[str] = None
    outgoing_dependents_id: Optional[str] = None
    tags: Optional[str] = None
    due_date: Optional[str] = None
    start_date: Optional[str] = None
    deadline_type: Optional[str] = None
    recurrence_frequency: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    last_modified_at: Optional[str] = None
    task_goal: Optional[str] = None
    input_data_context: Optional[str] = None
    desired_output_format: Optional[str] = None
    ai_action_process_free_text: Optional[str] = None
    ai_action_process_dropdown: Optional[str] = None
    ai_workflow_status: Optional[str] = None
    allow_autonomous_execution: Optional[bool] = None
    number_of_variations: Optional[int] = None
    desired_style_tone: Optional[str] = None
    specific_constraints_instructions: Optional[str] = None
    ai_behavior_on_uncertainty: Optional[str] = None
    ai_creativity_level: Optional[str] = None
    ai_processing_priority: Optional[str] = None
    ai_agent_status_log: Optional[str] = None
    ai_output_result_link: Optional[str] = None
    action_required_from_user: Optional[str] = None
    related_portfolios: Optional[str] = None
    related_projects: Optional[str] = None
    related_sections: Optional[str] = None
    related_tasks: Optional[str] = None
    related_tasks_id: Optional[str] = None
    related_entities: Optional[str] = None
    target_audience: Optional[str] = None
    task_purpose: Optional[str] = None
    type: Optional[str] = None
    task_type: Optional[str] = None
    estimated_user_time: Optional[str] = None
    cognitive_load: Optional[str] = None
    energy_level_required: Optional[str] = None
    required_tools_software: Optional[str] = None
    required_hardware: Optional[str] = None
    required_skills: Optional[str] = None
    estimated_cost_budget: Optional[str] = None
    expected_impact_success_metric: Optional[str] = None
    location: Optional[str] = None
    execution_location: Optional[str] = None
    required_devices: Optional[str] = None
    internet_requirement: Optional[str] = None
    focus_requirement: Optional[str] = None
    optimal_time_of_day: Optional[str] = None
    assignee: Optional[str] = None
    collaborators: Optional[str] = None
    related_entity: Optional[str] = None
    waiting_for: Optional[str] = None
    financial_return_value_speed: Optional[str] = None
    ai_output_rating: Optional[str] = None
    feedback_for_ai: Optional[str] = None
    suggested_initial_steps_subtasks: Optional[str] = None
    related_areas_for_ai_to_consider: Optional[str] = None
    potential_dependencies_related_tasks: Optional[str] = None

class TaskRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    notes: Optional[str] = None
    task_comments: Optional[str] = None
    portfolio_id: Optional[int] = None
    project_id: Optional[int] = None
    section_id: Optional[int] = None
    priority_id: Optional[int] = None
    due_date: Optional[str] = None
    start_date: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    last_modified_at: Optional[str] = None
    # Add other fields as needed for full API/test compatibility

    class Config:
        orm_mode = True

# Additional lookup/join tables for other multi-selects and dropdowns can be added similarly.
