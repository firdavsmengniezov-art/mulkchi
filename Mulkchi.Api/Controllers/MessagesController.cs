using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Models.Foundations.Messages.Exceptions;
using Mulkchi.Api.Services.Foundations.Messages;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService messageService;

    public MessagesController(IMessageService messageService)
    {
        this.messageService = messageService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<Message>> PostMessageAsync(Message message)
    {
        try
        {
            Message addedMessage = await this.messageService.AddMessageAsync(message);
            return Created("message", addedMessage);
        }
        catch (MessageValidationException messageValidationException)
        {
            return BadRequest(messageValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
        {
            return BadRequest(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyException messageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageDependencyException.InnerException);
        }
        catch (MessageServiceException messageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IQueryable<Message>> GetAllMessages()
    {
        try
        {
            IQueryable<Message> messages = this.messageService.RetrieveAllMessages();
            return Ok(messages);
        }
        catch (MessageDependencyException messageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageDependencyException.InnerException);
        }
        catch (MessageServiceException messageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Message>> GetMessageByIdAsync(Guid id)
    {
        try
        {
            Message message = await this.messageService.RetrieveMessageByIdAsync(id);
            return Ok(message);
        }
        catch (MessageValidationException messageValidationException)
        {
            return BadRequest(messageValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
            when (messageDependencyValidationException.InnerException is NotFoundMessageException)
        {
            return NotFound(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
        {
            return BadRequest(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyException messageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageDependencyException.InnerException);
        }
        catch (MessageServiceException messageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Message>> PutMessageAsync(Message message)
    {
        try
        {
            Message modifiedMessage = await this.messageService.ModifyMessageAsync(message);
            return Ok(modifiedMessage);
        }
        catch (MessageValidationException messageValidationException)
        {
            return BadRequest(messageValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
            when (messageDependencyValidationException.InnerException is NotFoundMessageException)
        {
            return NotFound(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
        {
            return BadRequest(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyException messageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageDependencyException.InnerException);
        }
        catch (MessageServiceException messageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Message>> DeleteMessageByIdAsync(Guid id)
    {
        try
        {
            Message deletedMessage = await this.messageService.RemoveMessageByIdAsync(id);
            return Ok(deletedMessage);
        }
        catch (MessageValidationException messageValidationException)
        {
            return BadRequest(messageValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
            when (messageDependencyValidationException.InnerException is NotFoundMessageException)
        {
            return NotFound(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyValidationException messageDependencyValidationException)
        {
            return BadRequest(messageDependencyValidationException.InnerException);
        }
        catch (MessageDependencyException messageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageDependencyException.InnerException);
        }
        catch (MessageServiceException messageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, messageServiceException.InnerException);
        }
    }
}
