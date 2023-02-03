
# -*- coding: utf-8 -*-
"""
create a json dictionary of file and its sha256 hash
python filesha256.py sf*.fs > index.json
python filesha256.py *.fs > index.json
{
    "sfa3_ggpo.fs": "0785c77a15bd40b546d39f691f306eefe8ad5f09c89c1f33b9ce3b4f1ed9fa36",
    "sfa_ggpo.fs": "e5defc38698ab7cb569c7840e692817a90889c0b228086caad41c0ca5f2177f5",
    "sfiii3n_ggpo.fs": "8c143610e46c4670b6847391ac5ccb5b35efc2bed56e364e548f6d65da7e2d16",
    "ssf2t_ggpo.fs": "0e736bb918cfee9281f6dc181cc8f5a9de294d890b828e8a977dbc9fa84e1b8d",
}
"""

import json
import hashlib
import glob
import os


def sha256digest(fname):
    return hashlib.sha256(open(fname, 'rb').read()).hexdigest()


def generateDigestJson(*args):
    result = {}
    for arg in args:
        for file in glob.glob(arg):
            result[os.path.basename(file)] = sha256digest(file)
    print json.dumps(result, sort_keys=True, indent=2)


if __name__ == "__main__":
    import sys

    generateDigestJson(*sys.argv[1:])