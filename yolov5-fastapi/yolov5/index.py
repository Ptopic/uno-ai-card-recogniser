import torch

from IPython.display import Image, clear_output  # to display images
from utils.downloads import attempt_download  # to download models/datasets

# clear_output()
print('Setup complete. Using torch %s %s' % (torch.__version__, torch.cuda.get_device_properties(0) if torch.cuda.is_available() else 'CPU'))

# import yaml
# with open(dataset.location + "/data.yaml", 'r') as stream:
#     num_classes = str(yaml.safe_load(stream)['nc'])

import torch
print("GPU is available" if torch.cuda.is_available() else "GPU is not available")
print(f"GPU Name: {torch.cuda.get_device_name(0)}" if torch.cuda.is_available() else "")

print(torch.cuda.is_available())  # Should print: True
print(torch.__version__)  # Should print the PyTorch version
print(torch.version.cuda)  # Should print the CUDA version
