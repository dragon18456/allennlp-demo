"""
The tasks endpoint lists all demo tasks and some info about them.
"""
import logging
import flask

from allennlp_demo.common.logs import configure_logging
from allennlp_models.pretrained import get_tasks
from allennlp.common.task_card import TaskCard
from allennlp.common.params import Params

logger = logging.getLogger(__name__)



class TasksService(flask.Flask):
    def __init__(self, name: str = "tasks"):
        super().__init__(name)
        configure_logging(self)

        @self.route("/", methods=["GET"])
        def tasks():
            params = {
                "id": "ner",
                "name": "Negation",
                "description": "Negation is the tasks of detecting a negation keyword and its corresponding scope.",
                "expected_inputs": "The task expects an input sentence.",
                "expected_outputs": "The output is all the identified named entities (which can be one or more words) in the text.",
                "scope_and_limitations": None,
                "examples": [
                    {"sentence" : "This shirt was bought at Grandpa Joe's in downtown Deep Learning."},
                    {"sentence" : "AllenNLP is a PyTorch-based natural language processing library developed at the Allen Institute for Artificial Intelligence in Seattle."},
                    {"sentence" : "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"},
                    {"sentence" : "Michael Jordan is a professor at Berkeley."},
                    {"sentence" : "My preferred candidate is Cary Moon, but she won't be the next mayor of Seattle."},
                    {"sentence" : "If you like Paul McCartney you should listen to the first Wings album."},
                    {"sentence" : "When I told John that I wanted to move to Alaska, he warned me that I'd have trouble finding a Starbucks there."},
                    {"sentence" : "This is a negation sentence for the demo, wait, no it isn't. Hi Michael Jordan."}
                ],
            }
            tasks = get_tasks()
            nerparams = Params(params)
            tasks['ner'] = TaskCard.from_params(nerparams)
            return flask.jsonify(tasks)


if __name__ == "__main__":
    app = TasksService()
    app.run(host="0.0.0.0", port=8000)
