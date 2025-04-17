import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';
import { HttpStatus } from '@nestjs/common';
import { RdiPipelineDeployFailedException } from './rdi-deploy-failed.exception';

describe('RdiPipelineDeployFailedException', () => {
  it('should create an exception with default message and status code', () => {
    const exception = new RdiPipelineDeployFailedException();
    expect(exception.message).toEqual(
      ERROR_MESSAGES.RDI_DEPLOY_PIPELINE_FAILURE,
    );
    expect(exception.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toEqual({
      message: ERROR_MESSAGES.RDI_DEPLOY_PIPELINE_FAILURE,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiPipelineDeployFailed',
      errorCode: CustomErrorCodes.RdiDeployPipelineFailure,
      errors: [undefined],
    });
  });

  it('should create an exception with custom message and error', () => {
    const customMessage = 'Custom error message';
    const customError = 'Custom error';
    const exception = new RdiPipelineDeployFailedException(customMessage, {
      error: customError,
    });
    expect(exception.message).toEqual(customMessage);
    expect(exception.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toEqual({
      message: customMessage,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiPipelineDeployFailed',
      errorCode: CustomErrorCodes.RdiDeployPipelineFailure,
      errors: [customError],
    });
  });
});
