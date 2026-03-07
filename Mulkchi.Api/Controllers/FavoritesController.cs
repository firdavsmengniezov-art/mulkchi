using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Favorites.Exceptions;
using Mulkchi.Api.Services.Foundations.Favorites;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        this.favoriteService = favoriteService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<Favorite>> PostFavoriteAsync(Favorite favorite)
    {
        try
        {
            Favorite addedFavorite = await this.favoriteService.AddFavoriteAsync(favorite);
            return Created("favorite", addedFavorite);
        }
        catch (FavoriteValidationException favoriteValidationException)
        {
            return BadRequest(favoriteValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
        {
            return BadRequest(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyException favoriteDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteDependencyException.InnerException);
        }
        catch (FavoriteServiceException favoriteServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IQueryable<Favorite>> GetAllFavorites()
    {
        try
        {
            IQueryable<Favorite> favorites = this.favoriteService.RetrieveAllFavorites();
            return Ok(favorites);
        }
        catch (FavoriteDependencyException favoriteDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteDependencyException.InnerException);
        }
        catch (FavoriteServiceException favoriteServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Favorite>> GetFavoriteByIdAsync(Guid id)
    {
        try
        {
            Favorite favorite = await this.favoriteService.RetrieveFavoriteByIdAsync(id);
            return Ok(favorite);
        }
        catch (FavoriteValidationException favoriteValidationException)
        {
            return BadRequest(favoriteValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
            when (favoriteDependencyValidationException.InnerException is NotFoundFavoriteException)
        {
            return NotFound(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
        {
            return BadRequest(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyException favoriteDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteDependencyException.InnerException);
        }
        catch (FavoriteServiceException favoriteServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Favorite>> PutFavoriteAsync(Favorite favorite)
    {
        try
        {
            Favorite modifiedFavorite = await this.favoriteService.ModifyFavoriteAsync(favorite);
            return Ok(modifiedFavorite);
        }
        catch (FavoriteValidationException favoriteValidationException)
        {
            return BadRequest(favoriteValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
            when (favoriteDependencyValidationException.InnerException is NotFoundFavoriteException)
        {
            return NotFound(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
        {
            return BadRequest(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyException favoriteDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteDependencyException.InnerException);
        }
        catch (FavoriteServiceException favoriteServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Favorite>> DeleteFavoriteByIdAsync(Guid id)
    {
        try
        {
            Favorite deletedFavorite = await this.favoriteService.RemoveFavoriteByIdAsync(id);
            return Ok(deletedFavorite);
        }
        catch (FavoriteValidationException favoriteValidationException)
        {
            return BadRequest(favoriteValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
            when (favoriteDependencyValidationException.InnerException is NotFoundFavoriteException)
        {
            return NotFound(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyValidationException favoriteDependencyValidationException)
        {
            return BadRequest(favoriteDependencyValidationException.InnerException);
        }
        catch (FavoriteDependencyException favoriteDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteDependencyException.InnerException);
        }
        catch (FavoriteServiceException favoriteServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, favoriteServiceException.InnerException);
        }
    }
}
