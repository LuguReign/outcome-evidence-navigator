import unittest
from analysis import checks, load_data, retrieve, source_url


class PilotChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = load_data()
        cls.rows = {r["id"]: r for r in cls.data["indicators"]}

    def test_dropped_indicator_is_not_compared_with_original_target(self):
        self.assertIn("No current target / dropped", checks(self.rows["VN-09"]))
        self.assertNotIn("Below current target", checks(self.rows["VN-09"]))

    def test_revision_and_non_additivity_are_visible(self):
        self.assertIn("Target revised", checks(self.rows["VN-05"]))
        self.assertIn("Non-additive subindicators", checks(self.rows["VN-10"]))

    def test_retrieval_has_source_page(self):
        matches = retrieve("Argentina hypertension under treatment", self.data)
        self.assertEqual(matches[0]["indicator"]["id"], "AR-06")
        self.assertTrue(matches[0]["url"].endswith("#page=43"))

    def test_all_rows_have_valid_project_and_source(self):
        projects = {p["id"]: p for p in self.data["projects"]}
        self.assertEqual(len(self.rows), len(self.data["indicators"]))
        for row in self.data["indicators"]:
            self.assertIn(row["project_id"], projects)
            self.assertTrue(source_url(projects[row["project_id"]], row).startswith("https://documents1.worldbank.org/"))
            self.assertGreater(row["page"], 0)


if __name__ == "__main__":
    unittest.main()
