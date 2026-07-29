"""
Management command to seed the database with initial data for the AtelierAI platform.
Run with: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

from knowledge_base.models import ResourceCategory
from learning.models import LearningModule, Lesson, Exercise
from accounts.models import UserProfile
from progress.models import UserStats as ProgressUserStats


class Command(BaseCommand):
    help = "Seed the database with initial learning content, categories, and demo users."

    def handle(self, *args, **options):
        self._seed_categories()
        self._seed_modules()
        self._seed_lessons_and_exercises()
        self._seed_users()
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully."))

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _info(self, msg):
        self.stdout.write(f"  {msg}")

    def _skip(self, msg):
        self.stdout.write(f"  [skip] {msg}")

    def _get_category(self, slug):
        return ResourceCategory.objects.get(slug=slug)

    def _get_module(self, title):
        return LearningModule.objects.get(title=title)

    # ------------------------------------------------------------------
    # 1. Resource Categories
    # ------------------------------------------------------------------
    def _seed_categories(self):
        self.stdout.write("\n--- Resource Categories ---")
        categories = [
            {"name": "Perspective", "slug": "perspective",
             "description": "Learn how to create depth and 3D space on a 2D surface", "icon": "\U0001f4d0"},
            {"name": "Shading & Value", "slug": "shading-value",
             "description": "Master light, shadow, and tonal values", "icon": "\U0001f313"},
            {"name": "Anatomy", "slug": "anatomy",
             "description": "Study human and animal anatomy for drawing", "icon": "\U0001f9cd"},
            {"name": "Line Control", "slug": "line-control",
             "description": "Develop confident and precise line work", "icon": "✏️"},
            {"name": "Composition", "slug": "composition",
             "description": "Arrange elements effectively in your artwork", "icon": "\U0001f5bc️"},
            {"name": "Color Theory", "slug": "color-theory",
             "description": "Understand color relationships and harmony", "icon": "\U0001f3a8"},
        ]
        for cat_data in categories:
            obj, created = ResourceCategory.objects.get_or_create(
                slug=cat_data["slug"],
                defaults=cat_data,
            )
            if created:
                self._info(f"Created category: {obj.name}")
            else:
                self._skip(f"Category already exists: {obj.name}")

    # ------------------------------------------------------------------
    # 2. Learning Modules
    # ------------------------------------------------------------------
    def _seed_modules(self):
        self.stdout.write("\n--- Learning Modules ---")
        modules = [
            {
                "title": "Lines & Ellipses",
                "description": "Master the fundamental building blocks of drawing "
                               "- straight lines, curved lines, and ellipses.",
                "order_index": 1, "difficulty": "beginner", "icon": "✏️",
                "category_slug": "line-control",
            },
            {
                "title": "Basic Perspective",
                "description": "Understand 1-point, 2-point, and 3-point perspective "
                               "to create depth in your drawings.",
                "order_index": 2, "difficulty": "beginner", "icon": "\U0001f4d0",
                "category_slug": "perspective",
            },
            {
                "title": "Constructing Objects",
                "description": "Learn to break down complex objects into simple geometric "
                               "forms like boxes, spheres, and cylinders.",
                "order_index": 3, "difficulty": "beginner", "icon": "\U0001f4e6",
                "category_slug": "perspective",
            },
            {
                "title": "Value & Shading",
                "description": "Explore how light creates form through shading techniques "
                               "including hatching and blending.",
                "order_index": 4, "difficulty": "intermediate", "icon": "\U0001f313",
                "category_slug": "shading-value",
            },
            {
                "title": "Figure Drawing Basics",
                "description": "Introduction to drawing the human figure using gesture, "
                               "proportions, and simple anatomy.",
                "order_index": 5, "difficulty": "intermediate", "icon": "\U0001f9cd",
                "category_slug": "anatomy",
            },
            {
                "title": "Composition & Design",
                "description": "Learn how to arrange visual elements to create compelling "
                               "and balanced artworks.",
                "order_index": 6, "difficulty": "advanced", "icon": "\U0001f5bc️",
                "category_slug": "composition",
            },
        ]
        for mod_data in modules:
            cat = self._get_category(mod_data.pop("category_slug"))
            defaults = {k: v for k, v in mod_data.items() if k != "title"}
            defaults["category"] = cat
            obj, created = LearningModule.objects.get_or_create(
                title=mod_data["title"],
                defaults=defaults,
            )
            if created:
                self._info(f"Created module: {obj.title}")
            else:
                self._skip(f"Module already exists: {obj.title}")

    # ------------------------------------------------------------------
    # 3. Lessons & Exercises
    # ------------------------------------------------------------------
    def _seed_lessons_and_exercises(self):
        self.stdout.write("\n--- Lessons & Exercises ---")

        lessons_data = [
            # ===== Module: Lines & Ellipses =====
            {
                "module_title": "Lines & Ellipses",
                "lessons": [
                    {
                        "title": "Introduction to Line Work",
                        "order_index": 1,
                        "estimated_minutes": 10,
                        "content": (
                            "Line work is the foundation of all drawing. Before you can "
                            "create complex illustrations, you must develop control over "
                            "the simplest tool at your disposal: the line. Every great "
                            "drawing, from quick sketches to finished masterpieces, is "
                            "built from individual lines.\n\n"
                            "There are several types of lines you will encounter: straight "
                            "lines, curved lines, zigzag lines, and varying line weights. "
                            "Each type communicates something different. A thick, heavy line "
                            "can suggest strength or shadow, while a thin, light line "
                            "suggests delicacy or distance.\n\n"
                            "The key to good line work is confidence. Hesitant, scratchy "
                            "lines — often called 'hairy' lines — undermine the clarity of "
                            "your drawing. Instead, aim for smooth, deliberate strokes "
                            "drawn from your shoulder rather than your wrist. This may feel "
                            "awkward at first, but it is the single most important habit "
                            "you can develop.\n\n"
                            "In this lesson, you will practice the basic strokes that form "
                            "the building blocks of all future drawing exercises."
                        ),
                        "exercises": [
                            {
                                "title": "Warm-Up Strokes",
                                "description": "Practice basic straight and curved strokes "
                                               "to build muscle memory.",
                                "instructions": (
                                    "Fill a page with repeated straight lines in various "
                                    "directions: horizontal, vertical, and diagonal. Focus "
                                    "on drawing each line in a single, smooth motion from "
                                    "your shoulder, not your wrist. Then practice gentle "
                                    "curves and S-curves. Aim for 50 lines per direction."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                            {
                                "title": "Ghosting Method",
                                "description": "Learn to visualize your line before drawing it.",
                                "instructions": (
                                    "Before placing your pen on the paper, hover above the "
                                    "surface and 'ghost' the motion several times — moving "
                                    "your arm as if drawing the line but without touching "
                                    "the paper. Once your muscle feels the path, commit and "
                                    "draw the line in one confident stroke. Repeat for "
                                    "various angles and lengths."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                        ],
                    },
                    {
                        "title": "Drawing Straight Lines",
                        "order_index": 2,
                        "estimated_minutes": 15,
                        "content": (
                            "Straight lines may seem simple, but drawing them by hand "
                            "without a ruler takes practice. The key is understanding that "
                            "a straight line is not just a mark — it is a controlled motion "
                            "of your entire arm.\n\n"
                            "When drawing a straight line, lock your wrist and pivot from "
                            "your elbow or shoulder. Your wrist should remain relatively "
                            "still while your upper arm guides the motion. This produces "
                            "longer, smoother lines than trying to draw from the fingers.\n\n"
                            "Line orientation matters too. Most people find horizontal lines "
                            "easier than vertical ones, and diagonal lines the most "
                            "challenging. Practice all orientations, paying special attention "
                            "to your weak directions.\n\n"
                            "Speed is also a factor. Drawing too slowly causes wobbles as "
                            "your hand micro-corrects. Drawing too fast sacrifices accuracy. "
                            "Find the 'sweet spot' speed where the line is both smooth "
                            "and reasonably accurate."
                        ),
                        "exercises": [
                            {
                                "title": "Connect the Dots",
                                "description": "Draw straight lines between pairs of points "
                                               "to train accuracy.",
                                "instructions": (
                                    "Place two dots randomly on your paper. In one smooth "
                                    "stroke, draw a straight line that passes through both "
                                    "dots. Do not correct or retrace. Repeat with dots at "
                                    "varying distances and angles. Progress to connecting "
                                    "three or more dots in sequence."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                            {
                                "title": "Plane Filling",
                                "description": "Fill rectangular planes with parallel straight lines.",
                                "instructions": (
                                    "Draw several rectangles of different sizes. Fill each "
                                    "with evenly spaced parallel lines — horizontal for one, "
                                    "vertical for another, diagonal for a third. Try to keep "
                                    "the spacing consistent without measuring."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                        ],
                    },
                    {
                        "title": "Curves and Ellipses",
                        "order_index": 3,
                        "estimated_minutes": 15,
                        "content": (
                            "Curves and ellipses are everywhere in drawing — from the arc "
                            "of an eyebrow to the ellipse of a wheel seen in perspective. "
                            "Mastering them opens the door to drawing organic and "
                            "geometric forms alike.\n\n"
                            "An ellipse is essentially a circle seen at an angle. The "
                            "degree of 'squash' determines the angle of view. A very flat "
                            "ellipse means you are viewing the circle edge-on; a round "
                            "ellipse means you are looking at it face-on.\n\n"
                            "The most common mistake beginners make is drawing ellipses "
                            "with pointed ends — they should be perfectly rounded at both "
                            "extremities. Another mistake is asymmetry, where one side is "
                            "heavier or wider than the other.\n\n"
                            "Practice drawing ellipses by making continuous loops. Start "
                            "with two or three passes over the same elliptical path — the "
                            "first pass finds the shape, subsequent passes refine it. "
                            "Aim for smoothness over perfection."
                        ),
                        "exercises": [
                            {
                                "title": "Ellipse Sheets",
                                "description": "Fill pages with ellipses of varying sizes "
                                               "and angles.",
                                "instructions": (
                                    "Draw rows of ellipses across your page, varying the "
                                    "width and height. Start with tall, narrow ellipses and "
                                    "progress to wide, flat ones. Aim for consistent shape "
                                    "within each row. Draw each ellipse with two to three "
                                    "smooth looping passes."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                            {
                                "title": "Ellipses in Planes",
                                "description": "Fit ellipses inside rectangular planes "
                                               "to practice perspective.",
                                "instructions": (
                                    "Draw rectangles at various angles. Inside each, draw "
                                    "an ellipse that touches all four sides at their "
                                    "midpoints. This simulates drawing circular forms in "
                                    "perspective, which is essential for bottles, wheels, "
                                    "and cylindrical objects."
                                ),
                                "difficulty": "beginner",
                                "category": "line-control",
                            },
                        ],
                    },
                ],
            },
            # ===== Module: Basic Perspective =====
            {
                "module_title": "Basic Perspective",
                "lessons": [
                    {
                        "title": "One-Point Perspective",
                        "order_index": 1,
                        "estimated_minutes": 15,
                        "content": (
                            "One-point perspective is the simplest form of perspective "
                            "drawing. It uses a single vanishing point on the horizon line "
                            "toward which all parallel lines converge. Think of looking "
                            "straight down a long hallway or railroad track — the walls "
                            "and rails appear to meet at a single point in the distance.\n\n"
                            "The key elements are the horizon line (your eye level), the "
                            "vanishing point (where parallel lines converge), and the "
                            "orthogonal lines (lines that recede toward the vanishing "
                            "point). Everything in the scene follows these guidelines.\n\n"
                            "One-point perspective is ideal for interior spaces, roads, "
                            "and scenes where the viewer faces the subject directly. "
                            "It creates a strong sense of depth and draws the eye naturally "
                            "toward the vanishing point.\n\n"
                            "To construct a one-point perspective drawing, start with the "
                            "horizon line, place the vanishing point, and then draw your "
                            "orthogonal lines extending from it. Vertical and horizontal "
                            "lines remain perfectly straight — only the depth lines change "
                            "angle."
                        ),
                        "exercises": [
                            {
                                "title": "Hallway Drawing",
                                "description": "Draw a hallway or tunnel in one-point perspective.",
                                "instructions": (
                                    "Draw a horizon line across your page and place a "
                                    "vanishing point at its center. Draw a rectangle for "
                                    "the far wall, then connect its corners to the vanishing "
                                    "point with orthogonal lines. Add doors, windows, or "
                                    "lights along the walls, ensuring they also follow the "
                                    "orthogonal lines."
                                ),
                                "difficulty": "beginner",
                                "category": "perspective",
                            },
                            {
                                "title": "Boxes in One-Point",
                                "description": "Practice placing boxes in one-point perspective.",
                                "instructions": (
                                    "Draw a horizon line with a vanishing point. Draw "
                                    "several boxes at different positions: above the horizon, "
                                    "below it, and to the left and right. Ensure all receding "
                                    "edges point to the single vanishing point. Pay attention "
                                    "to which faces are visible from each position."
                                ),
                                "difficulty": "beginner",
                                "category": "perspective",
                            },
                        ],
                    },
                    {
                        "title": "Two-Point Perspective",
                        "order_index": 2,
                        "estimated_minutes": 20,
                        "content": (
                            "Two-point perspective gives you much more flexibility than "
                            "one-point. Instead of viewing a scene straight-on, you are "
                            "now seeing it from an angle. This means there are two vanishing "
                            "points, one on each side of the subject.\n\n"
                            "Imagine standing at a street corner looking at a building. "
                            "One side of the building recedes toward your left, the other "
                            "toward your right. Both sides converge at their respective "
                            "vanishing points on the horizon line.\n\n"
                            "In two-point perspective, only vertical lines remain truly "
                            "vertical. All other parallel lines converge toward one of the "
                            "two vanishing points. The placement of vanishing points "
                            "determines the viewing angle — closer together gives a more "
                            "dramatic perspective, farther apart gives a more natural view.\n\n"
                            "This technique is widely used for drawing architecture, "
                            "vehicles, and any scene where the subject is viewed from a corner "
                            "or angle rather than face-on."
                        ),
                        "exercises": [
                            {
                                "title": "Box City",
                                "description": "Draw multiple boxes in two-point perspective.",
                                "instructions": (
                                    "Set up a horizon line with two vanishing points at "
                                    "opposite ends. Draw at least five boxes at different "
                                    "positions and heights. Some should be above the horizon, "
                                    "some below. Ensure all receding edges connect to either "
                                    "the left or right vanishing point."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                            {
                                "title": "Street Scene",
                                "description": "Create a simple street corner using two-point perspective.",
                                "instructions": (
                                    "Draw a horizon line with two vanishing points. Add a "
                                    "sidewalk and a building on one corner. Use the vanishing "
                                    "points to guide all receding edges — windows, doors, "
                                    "roof lines, and sidewalk edges. Add details like "
                                    "lampposts keeping them vertical."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                        ],
                    },
                    {
                        "title": "Three-Point Perspective",
                        "order_index": 3,
                        "estimated_minutes": 20,
                        "content": (
                            "Three-point perspective adds a third vanishing point either "
                            "above or below the subject, creating dramatic views looking "
                            "up at a tall building (worm's-eye view) or looking down from "
                            "a great height (bird's-eye view).\n\n"
                            "The first two vanishing points sit on the horizon line as in "
                            "two-point perspective. The third vanishing point is placed "
                            "far above or far below the horizon. All vertical lines now "
                            "converge toward this third point — nothing remains parallel.\n\n"
                            "This technique is essential for drawing skyscrapers, deep "
                            "canyons, and any scene with extreme vertical perspective. "
                            "It creates the most dynamic and dramatic sense of depth.\n\n"
                            "Three-point perspective requires careful planning. The third "
                            "vanishing point should be placed far enough away that the "
                            "convergence is natural-looking. Too close and the distortion "
                            "becomes cartoonish; too far and the effect is barely noticeable."
                        ),
                        "exercises": [
                            {
                                "title": "Looking Up at a Building",
                                "description": "Draw a tall building from a worm's-eye view.",
                                "instructions": (
                                    "Place two vanishing points on your horizon line and "
                                    "a third far above the horizon. Draw a tall building "
                                    "whose vertical edges all converge toward the top "
                                    "vanishing point. Add windows and architectural details "
                                    "that follow the same convergence."
                                ),
                                "difficulty": "advanced",
                                "category": "perspective",
                            },
                            {
                                "title": "Bird's-Eye City Block",
                                "description": "Draw a city block as seen from above.",
                                "instructions": (
                                    "Place two vanishing points on the horizon and a third "
                                    "far below it. Draw several buildings whose vertical "
                                    "edges converge downward. This simulates looking down "
                                    "from a tall building or helicopter."
                                ),
                                "difficulty": "advanced",
                                "category": "perspective",
                            },
                        ],
                    },
                ],
            },
            # ===== Module: Constructing Objects =====
            {
                "module_title": "Constructing Objects",
                "lessons": [
                    {
                        "title": "Boxes and Rectangular Forms",
                        "order_index": 1,
                        "estimated_minutes": 15,
                        "content": (
                            "Almost every man-made object can be broken down into boxes. "
                            "Buildings, furniture, vehicles, and appliances all start as "
                            "variations on the simple rectangular form. Learning to draw "
                            "boxes in perspective is therefore one of the most valuable "
                            "skills you can develop.\n\n"
                            "A box in perspective has three sets of parallel edges: those "
                            "running along the X, Y, and Z axes. In two-point perspective, "
                            "two sets converge to their respective vanishing points, while "
                            "the vertical set stays parallel.\n\n"
                            "Pay attention to the proportions of your boxes. A cube has "
                            "equal width, height, and depth. A rectangular box may stretch "
                            "more along one axis. Use the 'Y' shape at the nearest corner "
                            "to establish the three dimensions before adding the rest of "
                            "the faces.\n\n"
                            "Practice drawing boxes from memory and from observation. "
                            "Rotate them mentally and draw them from different angles. "
                            "This builds your 'mental library' of forms."
                        ),
                        "exercises": [
                            {
                                "title": "Cube Rotation",
                                "description": "Draw cubes at various rotations.",
                                "instructions": (
                                    "Draw a grid of at least nine cubes seen from different "
                                    "angles. Start with a front-facing view (one-point) and "
                                    "gradually rotate through various two-point views. Pay "
                                    "attention to how the visible faces change size as the "
                                    "cube rotates."
                                ),
                                "difficulty": "beginner",
                                "category": "perspective",
                            },
                            {
                                "title": "Box Subdivision",
                                "description": "Subdivide boxes to create complex forms.",
                                "instructions": (
                                    "Draw a large box and subdivide it using perspective "
                                    "techniques. Use intersecting diagonals to find the "
                                    "center of each face, then divide further to create "
                                    "a grid. Use this grid to 'carve' windows, doors, or "
                                    "other features into the surface."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                        ],
                    },
                    {
                        "title": "Spheres and Cylinders",
                        "order_index": 2,
                        "estimated_minutes": 15,
                        "content": (
                            "Spheres and cylinders are the curved counterparts to boxes. "
                            "While boxes have flat faces meeting at sharp edges, spheres "
                            "and cylinders have continuous curved surfaces. Drawing them "
                            "convincingly requires understanding how to draw ellipses in "
                            "perspective.\n\n"
                            "A sphere is essentially a circle seen from any angle. However, "
                            "to make a sphere feel three-dimensional, you need to understand "
                            "its contour lines — the latitude and longitude lines that wrap "
                            "around its surface. These lines help define the sphere's volume.\n\n"
                            "A cylinder is a shape created by extruding a circle along a "
                            "straight axis. In perspective, a cylinder consists of two "
                            "ellipses (the top and bottom faces) connected by vertical "
                            "tangent lines. The ellipses become narrower the closer they "
                            "are to your eye level.\n\n"
                            "The most common mistake with cylinders is making the bottom "
                            "ellipse too round. Remember: if the cylinder is below the "
                            "horizon, the bottom ellipse is actually rounder than the top "
                            "one because it is farther from your eye level."
                        ),
                        "exercises": [
                            {
                                "title": "Sphere Construction",
                                "description": "Draw spheres using contour lines.",
                                "instructions": (
                                    "Draw several circles of different sizes. Inside each, "
                                    "add contour lines that wrap around the sphere's surface "
                                    "— like latitude lines on a globe. Make the contour "
                                    "lines curve more toward the edges of the sphere. This "
                                    "trains your eye to see volume rather than flat shapes."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                            {
                                "title": "Cylinder Stack",
                                "description": "Draw stacked cylinders to practice ellipse variation.",
                                "instructions": (
                                    "Draw a vertical cylinder, then stack smaller cylinders "
                                    "on top of it. Each cylinder should have properly "
                                    "proportioned ellipses — wider when farther from eye "
                                    "level, narrower when closer. This exercise simulates "
                                    "drawing objects like bottles, towers, or cans."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                        ],
                    },
                    {
                        "title": "Combining Basic Forms",
                        "order_index": 3,
                        "estimated_minutes": 20,
                        "content": (
                            "Now that you understand individual forms — boxes, spheres, "
                            "cylinders — it is time to combine them into more complex "
                            "objects. This is the core of constructive drawing: seeing "
                            "the simple shapes that make up everything around you.\n\n"
                            "Start by analyzing any complex object as a collection of basic "
                            "forms. A lamp might be a cylinder (base), a sphere (shade), "
                            "and a thin cylinder (pole). A human head can be simplified "
                            "to a sphere with a box-like jaw. A car is a box with cylinder "
                            "wheels and curved panels on top.\n\n"
                            "The key is to draw these basic forms lightly first, establishing "
                            "the overall proportions and perspective before adding details. "
                            "This 'block-in' stage is critical for getting the structure "
                            "right. Details can always be added later, but fixing a poorly "
                            "constructed foundation is very difficult.\n\n"
                            "Practice by looking at everyday objects and mentally breaking "
                            "them down into their component forms before drawing them."
                        ),
                        "exercises": [
                            {
                                "title": "Object Deconstruction",
                                "description": "Break down a household object into basic forms.",
                                "instructions": (
                                    "Choose a household object (a teapot, chair, or lamp). "
                                    "Analyze it as a combination of boxes, spheres, and "
                                    "cylinders. Draw the basic forms first to establish "
                                    "the structure, then add details on top. Draw the same "
                                    "object from three different angles."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                            {
                                "title": "Still Life Construction",
                                "description": "Draw a simple still life using constructed forms.",
                                "instructions": (
                                    "Arrange three simple objects (e.g., a mug, an apple, "
                                    "a book) in front of you. Draw each using constructive "
                                    "techniques: boxes for the book, a cylinder for the "
                                    "mug, a sphere for the apple. Pay attention to how "
                                    "the objects relate to each other spatially."
                                ),
                                "difficulty": "intermediate",
                                "category": "perspective",
                            },
                        ],
                    },
                ],
            },
            # ===== Module: Value & Shading =====
            {
                "module_title": "Value & Shading",
                "lessons": [
                    {
                        "title": "Understanding Light and Shadow",
                        "order_index": 1,
                        "estimated_minutes": 15,
                        "content": (
                            "Value refers to how light or dark a tone is. Shading is the "
                            "process of applying value to create the illusion of three-"
                            "dimensional form. Understanding light and shadow is essential "
                            "for making your drawings feel solid and realistic.\n\n"
                            "When light strikes an object, it creates a predictable pattern "
                            "of values: the highlight (brightest point where light hits "
                            "directly), the mid-tone (the object's local color in light), "
                            "the core shadow (the darkest part of the object itself, away "
                            "from the light), the reflected light (bounce light from "
                            "surrounding surfaces), and the cast shadow (the shadow the "
                            "object throws onto nearby surfaces).\n\n"
                            "This pattern is often called 'form shading' and it applies to "
                            "any three-dimensional object. Learning to see and reproduce "
                            "this value structure is what gives drawings their sense of "
                            "volume and depth.\n\n"
                            "Start by identifying the light source in your scene. Everything "
                            "else follows from that single decision. Keep the light source "
                            "consistent throughout your drawing."
                        ),
                        "exercises": [
                            {
                                "title": "Value Scale",
                                "description": "Create a smooth gradient from white to black.",
                                "instructions": (
                                    "Draw a long rectangle and divide it into 10 equal "
                                    "sections. Fill them with a gradient from pure white "
                                    "(section 1) to pure black (section 10), with evenly "
                                    "spaced mid-tones in between. The transition between "
                                    "each step should be barely noticeable."
                                ),
                                "difficulty": "beginner",
                                "category": "shading-value",
                            },
                            {
                                "title": "Sphere Shading",
                                "description": "Shade a sphere using proper form shading.",
                                "instructions": (
                                    "Draw a circle and decide on a light source direction. "
                                    "Shade the sphere using the full value structure: "
                                    "highlight, mid-tone, core shadow, reflected light, "
                                    "and cast shadow. Blend smoothly between values for "
                                    "a realistic rounded appearance."
                                ),
                                "difficulty": "intermediate",
                                "category": "shading-value",
                            },
                        ],
                    },
                    {
                        "title": "Hatching and Cross-Hatching",
                        "order_index": 2,
                        "estimated_minutes": 15,
                        "content": (
                            "Hatching is a shading technique that uses parallel lines to "
                            "build up value. The closer the lines are together, the darker "
                            "the tone. Cross-hatching layers lines in multiple directions "
                            "to achieve even deeper values and varied texture.\n\n"
                            "Hatching is one of the oldest and most versatile shading "
                            "techniques. It is used in everything from quick sketches to "
                            "detailed pen-and-ink illustrations. Unlike blending or "
                            "smudging, hatching keeps your drawing clean and precise.\n\n"
                            "Start with one direction of hatching that follows the contours "
                            "of your subject. For a cylinder, hatch along the curve. For a "
                            "flat surface, hatch in a consistent direction. Add a second "
                            "layer at a different angle for cross-hatching where darker "
                            "values are needed.\n\n"
                            "The spacing between lines creates different effects. Wide "
                            "spacing gives a light, airy feel. Tight spacing creates dense "
                            "shadow. Varying the pressure can also change line weight "
                            "within individual hatches."
                        ),
                        "exercises": [
                            {
                                "title": "Basic Hatching",
                                "description": "Practice hatching flat planes and curved surfaces.",
                                "instructions": (
                                    "Draw a cube, a cylinder, and a sphere. Shade each "
                                    "using hatching only, no blending. Follow the contours "
                                    "of each form — straight lines for the cube, curved "
                                    "lines for the cylinder and sphere. Vary line spacing "
                                    "to create light and dark areas."
                                ),
                                "difficulty": "intermediate",
                                "category": "shading-value",
                            },
                            {
                                "title": "Cross-Hatching Layers",
                                "description": "Build deep shadows using multiple cross-hatching layers.",
                                "instructions": (
                                    "Draw a simple still life with strong contrast. Shade "
                                    "it using cross-hatching with at least three layers "
                                    "in the darkest areas. Each layer should use a different "
                                    "angle. Keep the hatching clean and avoid random "
                                    "scribbling."
                                ),
                                "difficulty": "intermediate",
                                "category": "shading-value",
                            },
                        ],
                    },
                    {
                        "title": "Blending and Gradients",
                        "order_index": 3,
                        "estimated_minutes": 15,
                        "content": (
                            "Blending creates smooth transitions between values, producing "
                            "a soft, realistic look. Unlike hatching, which relies on "
                            "visible lines, blending creates continuous tonal gradients. "
                            "This technique is especially useful for portraits, clouds, "
                            "and any subject with soft edges.\n\n"
                            "Blending can be achieved through several methods: using a "
                            "blending stump (a tightly rolled paper tool), a soft cloth, "
                            "or even your finger. For graphite drawings, gradual layering "
                            "with soft pencils (2B, 4B, 6B) builds up rich, smooth tones.\n\n"
                            "The key to good blending is patience. Build up value gradually "
                            "in layers rather than trying to achieve the final darkness in "
                            "one pass. Each layer should be lighter than the final value, "
                            "allowing you to make subtle adjustments as you go.\n\n"
                            "A common pitfall is over-blending, which makes drawings look "
                            "muddy and lifeless. Always preserve some areas of pure white "
                            "(highlights) and pure dark (deep shadows) for contrast."
                        ),
                        "exercises": [
                            {
                                "title": "Gradient Practice",
                                "description": "Create smooth transitions between values.",
                                "instructions": (
                                    "Draw several long rectangles. In each, create a smooth "
                                    "gradient from dark to light using blending techniques. "
                                    "Try different methods: finger blending, tissue, and "
                                    "blending stump. Compare the results and note the "
                                    "texture each method produces."
                                ),
                                "difficulty": "beginner",
                                "category": "shading-value",
                            },
                            {
                                "title": "Rounded Forms",
                                "description": "Shade rounded objects using blending.",
                                "instructions": (
                                    "Draw an egg, an apple, and a smooth stone. Shade each "
                                    "using blending techniques to create smooth transitions "
                                    "between highlights and shadows. Pay special attention "
                                    "to the core shadow and reflected light areas."
                                ),
                                "difficulty": "intermediate",
                                "category": "shading-value",
                            },
                        ],
                    },
                ],
            },
            # ===== Module: Figure Drawing Basics =====
            {
                "module_title": "Figure Drawing Basics",
                "lessons": [
                    {
                        "title": "Gesture Drawing",
                        "order_index": 1,
                        "estimated_minutes": 15,
                        "content": (
                            "Gesture drawing captures the essence of a pose in a brief, "
                            "energetic sketch. The goal is not anatomical accuracy but "
                            "rather to convey movement, flow, and the overall feeling of "
                            "the figure. Gesture drawings are typically done in 30 seconds "
                            "to 2 minutes.\n\n"
                            "Start with the 'line of action' — an imaginary curve that runs "
                            "through the figure, capturing its overall motion. This single "
                            "line establishes the dynamic feel of the pose before you add "
                            "any detail.\n\n"
                            "Build on the line of action by adding simple shapes for the "
                            "torso, head, and limbs. Keep these shapes loose and flowing. "
                            "Avoid straight, stiff lines. Curves and S-shapes make the "
                            "figure feel alive.\n\n"
                            "Gesture drawing is a skill that improves with quantity. The "
                            "more gestures you do, the more fluent your visual language "
                            "becomes. Aim for filled pages of quick poses rather than a "
                            "few detailed studies."
                        ),
                        "exercises": [
                            {
                                "title": "30-Second Poses",
                                "description": "Quick gesture sketches to capture movement.",
                                "instructions": (
                                    "Using reference images or a live model, draw 20 "
                                    "gesture sketches with a 30-second time limit for each. "
                                    "Focus on capturing the line of action and overall "
                                    "shape of the pose. Do not worry about details or "
                                    "anatomical accuracy."
                                ),
                                "difficulty": "beginner",
                                "category": "anatomy",
                            },
                            {
                                "title": "Flowing Lines",
                                "description": "Practice continuous-line gesture drawings.",
                                "instructions": (
                                    "Draw gestures without lifting your pen from the paper. "
                                    "The continuous line should flow through the figure, "
                                    "capturing both contour and interior movement. This "
                                    "trains your eye to follow the figure's energy rather "
                                    "than getting stuck on individual parts."
                                ),
                                "difficulty": "intermediate",
                                "category": "anatomy",
                            },
                        ],
                    },
                    {
                        "title": "Body Proportions",
                        "order_index": 2,
                        "estimated_minutes": 20,
                        "content": (
                            "Understanding human proportions is essential for drawing "
                            "believable figures. While every body is unique, there are "
                            "standard proportional guidelines that serve as a reliable "
                            "starting point.\n\n"
                            "The average adult figure is about 7.5 to 8 heads tall. The "
                            "torso (from the top of the shoulder to the crotch) is about "
                            "3 heads. The legs take up the remaining 4 heads. The elbows "
                            "align roughly with the waist, and the wrists align with the "
                            "mid-thigh when arms hang at the sides.\n\n"
                            "Proportions differ between genders and age groups. Women "
                            "typically have narrower shoulders and wider hips compared to "
                            "men. Children have proportionally larger heads and shorter "
                            "limbs. Understanding these differences allows you to draw "
                            "a wide range of figures convincingly.\n\n"
                            "Always establish the overall proportions before adding detail. "
                            "Use measuring techniques — hold your pencil at arm's length "
                            "to compare sizes visually — to check your proportions against "
                            "your reference."
                        ),
                        "exercises": [
                            {
                                "title": "Proportion Grid",
                                "description": "Draw a figure using the 8-head proportional system.",
                                "instructions": (
                                    "Draw a vertical line divided into 8 equal segments. "
                                    "Use each segment to place the major body landmarks: "
                                    "chin (1), nipples (2), navel (3), crotch (4), "
                                    "mid-thigh (5), knees (6), mid-calf (7), feet (8). "
                                    "Sketch a simple figure following these proportions."
                                ),
                                "difficulty": "intermediate",
                                "category": "anatomy",
                            },
                            {
                                "title": "Proportion Comparison",
                                "description": "Compare proportions across different body types.",
                                "instructions": (
                                    "Draw three figures side by side: an adult male, an "
                                    "adult female, and a child. Adjust the proportions for "
                                    "each — broader shoulders for the male, wider hips for "
                                    "the female, larger head-to-body ratio for the child. "
                                    "Note the proportional differences."
                                ),
                                "difficulty": "intermediate",
                                "category": "anatomy",
                            },
                        ],
                    },
                    {
                        "title": "Simplified Anatomy",
                        "order_index": 3,
                        "estimated_minutes": 20,
                        "content": (
                            "Full anatomical study takes years, but you can start drawing "
                            "convincing figures with a simplified understanding of the "
                            "major muscle groups and bone landmarks. The key is knowing "
                            "what lies beneath the skin and how it affects the surface "
                            "form.\n\n"
                            "Focus on the major masses: the ribcage (egg-shaped), the "
                            "pelvis (bowl-shaped), and the head. These three masses are "
                            "connected by the flexible spine. The limbs attach at the "
                            "shoulder girdle and hip joints.\n\n"
                            "Key surface landmarks include the collarbones (clavicles), "
                            "the shoulder blades (scapulae), the hip bones (iliac crests), "
                            "and the knee caps (patellae). These bony landmarks don't "
                            "change with muscle development and provide reliable reference "
                            "points.\n\n"
                            "For muscles, learn the major groups: the trapezius (neck and "
                            "upper back), deltoids (shoulders), pectorals (chest), biceps "
                            "and triceps (arms), abdominals (core), glutes (hips), and "
                            "quadriceps and hamstrings (thighs). Understanding their "
                            "shapes and attachment points will make your figures look "
                            "solid and correctly structured."
                        ),
                        "exercises": [
                            {
                                "title": "Mannequin Figure",
                                "description": "Build a figure using simplified anatomical shapes.",
                                "instructions": (
                                    "Draw a figure using simplified forms: an egg for the "
                                    "ribcage, a bowl for the pelvis, cylinders for the "
                                    "limbs, and a sphere for the head. Add the major muscle "
                                    "masses as simplified shapes on top. This 'mannequin' "
                                    "approach helps you see the figure as a 3D structure."
                                ),
                                "difficulty": "intermediate",
                                "category": "anatomy",
                            },
                            {
                                "title": "Surface Landmarks",
                                "description": "Identify key bony landmarks on a figure drawing.",
                                "instructions": (
                                    "Draw a figure from reference and clearly mark the "
                                    "visible bony landmarks: clavicles, elbows, wrists, "
                                    "iliac crests, knees, and ankles. Then shade the figure, "
                                    "paying attention to how muscles attach to these "
                                    "landmarks and how light plays over the forms."
                                ),
                                "difficulty": "advanced",
                                "category": "anatomy",
                            },
                        ],
                    },
                ],
            },
            # ===== Module: Composition & Design =====
            {
                "module_title": "Composition & Design",
                "lessons": [
                    {
                        "title": "Rule of Thirds and Framing",
                        "order_index": 1,
                        "estimated_minutes": 10,
                        "content": (
                            "The rule of thirds is one of the most fundamental composition "
                            "guidelines in visual art. Imagine dividing your canvas into "
                            "a 3x3 grid with two equally spaced horizontal lines and two "
                            "vertical lines. The four points where these lines intersect "
                            "are the strongest focal points.\n\n"
                            "Placing your subject at one of these intersection points "
                            "creates a more dynamic and interesting composition than "
                            "centering it. The human eye naturally gravitates toward "
                            "these points, making them ideal for positioning key elements.\n\n"
                            "Framing within a composition involves using elements in the "
                            "foreground — such as tree branches, archways, or windows — "
                            "to create a 'frame' around the main subject. This adds depth "
                            "and draws the viewer's eye toward the focal point.\n\n"
                            "While the rule of thirds is a guideline, not a law, it "
                            "provides an excellent starting point for arranging elements "
                            "in your artwork. As you gain experience, you can learn when "
                            "to follow it and when to break it for creative effect."
                        ),
                        "exercises": [
                            {
                                "title": "Thirds Grid Analysis",
                                "description": "Analyze existing artworks using the rule of thirds.",
                                "instructions": (
                                    "Find three photographs or paintings you admire. Draw "
                                    "a 3x3 grid over each (either digitally or using tracing "
                                    "paper). Note how the main subjects align with the "
                                    "intersection points or grid lines. Sketch thumbnail "
                                    "copies that simplify the composition."
                                ),
                                "difficulty": "beginner",
                                "category": "composition",
                            },
                            {
                                "title": "Natural Frame",
                                "description": "Create a composition with a foreground frame.",
                                "instructions": (
                                    "Sketch a landscape scene that uses a foreground "
                                    "element to frame the main subject — for example, "
                                    "tree branches framing a mountain, or an archway "
                                    "framing a building. The frame should be darker and "
                                    "less detailed than the focal point."
                                ),
                                "difficulty": "intermediate",
                                "category": "composition",
                            },
                        ],
                    },
                    {
                        "title": "Balance and Visual Weight",
                        "order_index": 2,
                        "estimated_minutes": 15,
                        "content": (
                            "Balance in composition refers to the distribution of visual "
                            "weight across your artwork. Every element in your composition "
                            "has visual weight — determined by its size, color, value, "
                            "texture, and placement. A well-balanced composition feels "
                            "harmonious and stable.\n\n"
                            "There are two types of balance: symmetrical and asymmetrical. "
                            "Symmetrical balance mirrors elements on either side of a "
                            "central axis, creating a formal, stable feel. Asymmetrical "
                            "balance uses different elements with equal visual weight on "
                            "each side, creating a more dynamic and interesting composition.\n\n"
                            "Visual weight is influenced by several factors: large objects "
                            "weigh more than small ones; dark values weigh more than light "
                            "ones; saturated colors weigh more than muted ones; isolated "
                            "elements weigh more than clustered ones.\n\n"
                            "To create asymmetrical balance, pair a large, light object on "
                            "one side with a small, dark object on the other. Or balance "
                            "a textured area with a smooth area of similar visual mass."
                        ),
                        "exercises": [
                            {
                                "title": "Symmetrical vs. Asymmetrical",
                                "description": "Create two compositions exploring different balance types.",
                                "instructions": (
                                    "Draw two abstract compositions using simple shapes."
                                    "The first should demonstrate symmetrical balance — "
                                    "mirroring elements on both sides. The second should "
                                    "demonstrate asymmetrical balance — using different "
                                    "elements with equal visual weight. Label the visual "
                                    "weight factors in each."
                                ),
                                "difficulty": "intermediate",
                                "category": "composition",
                            },
                            {
                                "title": "Visual Weight Study",
                                "description": "Experiment with balancing different visual elements.",
                                "instructions": (
                                    "Create a composition where a large, pale shape is "
                                    "balanced by a small, dark shape. Then try balancing "
                                    "a textured area against a smooth, saturated color "
                                    "area. Finally, balance a single large element against "
                                    "a group of smaller elements."
                                ),
                                "difficulty": "intermediate",
                                "category": "composition",
                            },
                        ],
                    },
                    {
                        "title": "Leading Lines and Focal Points",
                        "order_index": 3,
                        "estimated_minutes": 15,
                        "content": (
                            "Leading lines are visual pathways that guide the viewer's eye "
                            "through a composition. They can be literal lines (roads, "
                            "rivers, fences) or implied lines (the direction of a figure's "
                            "gaze, the arc of a gesture). Effective use of leading lines "
                            "creates a journey for the eye, making the artwork more "
                            "engaging.\n\n"
                            "Leading lines typically start from the edge or foreground of "
                            "the composition and guide the eye toward the main focal point. "
                            "Diagonal lines are particularly effective because they create "
                            "a sense of movement and energy. S-curves and spiral paths "
                            "can create a more leisurely, exploratory viewing experience.\n\n"
                            "A focal point is the area of greatest visual interest. It is "
                            "where the eye naturally rests after following the leading "
                            "lines. You can emphasize a focal point through contrast, "
                            "detail, color intensity, or placement at a rule-of-thirds "
                            "intersection.\n\n"
                            "Be careful not to include competing focal points that confuse "
                            "the viewer. If you have multiple points of interest, establish "
                            "a clear hierarchy — a primary focal point with secondary ones "
                            "that support rather than compete."
                        ),
                        "exercises": [
                            {
                                "title": "Leading Line Landscape",
                                "description": "Design a landscape with strong directional flow.",
                                "instructions": (
                                    "Draw a landscape that uses at least three different "
                                    "types of leading lines (e.g., a winding path, a row "
                                    "of trees, a river) that all guide the eye toward a "
                                    "single focal point. The focal point should have the "
                                    "highest contrast and detail in the scene."
                                ),
                                "difficulty": "advanced",
                                "category": "composition",
                            },
                            {
                                "title": "Focal Point Hierarchy",
                                "description": "Create a composition with clear focal hierarchy.",
                                "instructions": (
                                    "Draw an interior scene or crowded street with multiple "
                                    "elements. Establish a clear primary focal point (high "
                                    "contrast, detailed), two secondary focal points (less "
                                    "contrast, fewer details), and background elements "
                                    "(low contrast, minimal detail). Use leading lines to "
                                    "connect them."
                                ),
                                "difficulty": "advanced",
                                "category": "composition",
                            },
                        ],
                    },
                ],
            },
        ]

        for module_group in lessons_data:
            mod = self._get_module(module_group["module_title"])
            for lesson_data in module_group["lessons"]:
                exercises = lesson_data.pop("exercises", [])
                lesson_obj, created = Lesson.objects.get_or_create(
                    module=mod,
                    title=lesson_data["title"],
                    defaults={
                        "content": lesson_data["content"],
                        "order_index": lesson_data["order_index"],
                        "estimated_minutes": lesson_data["estimated_minutes"],
                    },
                )
                if created:
                    self._info(f"Created lesson: {lesson_obj.title}")
                else:
                    self._skip(f"Lesson already exists: {lesson_obj.title}")

                for ex_data in exercises:
                    ex_obj, ex_created = Exercise.objects.get_or_create(
                        lesson=lesson_obj,
                        title=ex_data["title"],
                        defaults={
                            "description": ex_data["description"],
                            "instructions": ex_data["instructions"],
                            "difficulty": ex_data["difficulty"],
                            "category": ex_data["category"],
                        },
                    )
                    if ex_created:
                        self._info(f"  Created exercise: {ex_obj.title}")
                    else:
                        self._skip(f"  Exercise already exists: {ex_obj.title}")

    # ------------------------------------------------------------------
    # 4. Users
    # ------------------------------------------------------------------
    def _seed_users(self):
        self.stdout.write("\n--- Users ---")

        # Admin superuser
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@atelierai.com",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self._info("Created admin superuser")
        else:
            self._skip("Admin user already exists")

        # Demo regular user
        demo_user, created = User.objects.get_or_create(
            username="demo",
            defaults={
                "email": "demo@atelierai.com",
            },
        )
        if created:
            demo_user.set_password("demo123")
            demo_user.save()
            self._info("Created demo user")
        else:
            self._skip("Demo user already exists")

        # UserProfile (get_or_create in case it was missed on a prior run)
        _, profile_created = UserProfile.objects.get_or_create(
            user=demo_user,
            defaults={
                "skill_level": "beginner",
                "interests": ["perspective", "shading"],
                "artistic_goals": "I want to learn drawing fundamentals",
            },
        )
        if profile_created:
            self._info("Created user profile for demo user")
        else:
            self._skip("User profile for demo user already exists")

        # UserStats (get_or_create in case it was missed on a prior run)
        _, stats_created = ProgressUserStats.objects.get_or_create(
            user=demo_user,
            defaults={
                "total_lessons_completed": 0,
                "total_exercises_done": 0,
                "total_mentor_queries": 0,
                "total_submissions": 0,
                "streak_days": 1,
                "last_active_date": timezone.now().date(),
            },
        )
        if stats_created:
            self._info("Created user stats for demo user")
        else:
            self._skip("User stats for demo user already exists")