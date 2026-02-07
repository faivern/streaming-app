using backend.Models;
using backend.Models.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/list")]
    [Authorize]
    public class ListController : ControllerBase
    {
        private readonly ListService _listService;
        private readonly TmdbService _tmdbService;

        public ListController(ListService listService, TmdbService tmdbService)
        {
            _listService = listService;
            _tmdbService = tmdbService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        [HttpGet]
        public async Task<IActionResult> GetUserLists()
        {
            try
            {
                var lists = await _listService.GetUserListsAsync(GetUserId());
                return Ok(lists);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();
                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateListRequest request)
        {
            var (valid, error) = ListService.ValidateListName(request.Name);
            if (!valid) return BadRequest(error);

            try
            {
                var userId = GetUserId();
                var listCount = await _listService.GetUserListCountAsync(userId);
                if (listCount >= ListService.MaxListsPerUser)
                    return Conflict($"You've reached the maximum of {ListService.MaxListsPerUser} lists.");

                var list = new Models.List
                {
                    UserId = userId,
                    Name = request.Name,
                    Description = request.Description,
                    IsPublic = request.IsPublic
                };

                var created = await _listService.CreateAsync(list);
                return Ok(created);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateListRequest request)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                if (request.Name is not null)
                {
                    var (valid, error) = ListService.ValidateListName(request.Name);
                    if (!valid) return BadRequest(error);
                    list.Name = request.Name;
                }

                if (request.Description is not null) list.Description = request.Description;
                if (request.IsPublic.HasValue) list.IsPublic = request.IsPublic.Value;

                var updated = await _listService.UpdateAsync(list);
                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _listService.DeleteAsync(id, GetUserId());
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItem(int id, [FromBody] AddListItemRequest request)
        {
            if(request.MediaType != "movie" && request.MediaType != "tv")
            {
                return BadRequest("MediaType must be either 'movie' or 'tv'.");
            }

            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                if (list.Items.Count >= ListService.MaxItemsPerList)
                    return Conflict($"This list has reached the maximum of {ListService.MaxItemsPerList:N0} items.");

                var item = new ListItem
                {
                    MediaType = request.MediaType,
                    TmdbId = request.TmdbId
                };

                // Server-side TMDB fetch
                if (request.MediaType == "movie")
                {
                    var details = await _tmdbService.GetMovieDetailsTypedAsync(request.TmdbId);
                    if (details is not null) TmdbFieldMapper.ApplyMovieDetails(item, details);
                }
                else
                {
                    var details = await _tmdbService.GetTvDetailsTypedAsync(request.TmdbId);
                    if (details is not null) TmdbFieldMapper.ApplyTvDetails(item, details);
                }

                list.Items.Add(item);
                await _listService.UpdateAsync(list);
                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }




        [HttpDelete("{id}/items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int id, int itemId)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                var item = list.Items.FirstOrDefault(i => i.Id == itemId);
                if (item is null) return NotFound();

                list.Items.Remove(item);
                await _listService.UpdateAsync(list);
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }
    }
}
